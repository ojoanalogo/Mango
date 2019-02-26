import { Service } from 'typedi';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { Role, RoleType } from './user_role.entity';
import { ProfilePicture } from './user_profile_picture.entity';
import { Logger } from '../../decorators';
import { JSONUtils } from '../../utils/json.utils';
import { UploadUtils, HashAlgorithm } from '../../utils/upload.utils';
import { ServerLogger } from '../../lib/logger';
import { PROFILE_PICTURES_RESOLUTIONS, PROFILE_PICTURES_FOLDER } from '../../../config';
import fs = require('fs-extra');
import sharp = require('sharp');
import path = require('path');

@Service()
export class UserService {

  constructor(
    @Logger(__filename) private readonly logger: ServerLogger,
    // begin injecting repos
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(ProfilePicture)
    private readonly profilePictureRepository: Repository<ProfilePicture>,
    // other services
    private readonly authService: AuthService,
    private readonly jsonUtils: JSONUtils) { }

  /**
   * Returns users from database
   * @param page - Page number
   * @returns A list with users
   */
  public async findAll(page: number = 1, limit: number = 15): Promise<User[]> {
    if (page < 1) {
      page = 1;
    }
    const toSkip: number = limit * (page - 1);
    const users = await
      this.userRepository.createQueryBuilder().where('is_active= :is_active', { is_active: 1 })
        .skip(toSkip)
        .take(limit)
        .getMany();
    return <User[]>(this.jsonUtils.filterDataFromObjects(users, this.jsonUtils.commonUserProperties));
  }

  /**
   * Creates a new user
   * @param user - User object
   * @returns The created user entity
   */
  public async createUser(userReq: User): Promise<User> {
    // create User
    const user = new User();
    user.email = userReq.email;
    user.password = userReq.password;
    const userInstance: User = await this.userRepository.save(userReq);
    // create JWT tokens
    const jwtToken = await this.authService.createJWT(userInstance);
    // now assign default Role
    const role: Role = new Role();
    role.role = RoleType.USER;
    role.user = userInstance;
    // save role in role repository
    await this.rolesRepository.save(role);
    // pass full JWT tokens
    userInstance.token = <any>jwtToken;
    this.logger.info(`User ${userInstance.email}(ID: ${userInstance.id}) was created`);
    // return user model object
    return this.jsonUtils.filterDataFromObject(userInstance, this.jsonUtils.commonUserProperties);
  }

  /**
   * Update user data in database
   * @param id - User ID
   * @param user - User object
   * @returns UpdateResult object
   */
  public async updateUser(id: number, user: User): Promise<User> {
    // remove ID field, this field can't be modified
    delete user.id;
    const userDB = await this.userRepository.findOne({ id: id });
    if (user.password) {
      await user.updatePassword();
      this.logger.info(`User (ID: ${userDB.id}) updated his password`);
    }
    await this.userRepository.update(userDB.id, user);
    this.logger.info(`User (ID: ${userDB.id}) was updated`);
    const userUpdated = await this.getUserByID(userDB.id);
    // delete all JWT tokens and create a new one if user updates his password or email (or both)
    if (user.password || user.email) {
      // delete old tokens
      await this.authService.deleteTokens(userUpdated);
      // create JWT tokens
      const jwtToken = await this.authService.createJWT(userUpdated);
      userDB.token = <any>jwtToken;
    }
    return userUpdated;
  }

  /**
   * Update user profile picture in database and disk storage
   * @param user - User object
   * @param uploadedPicture - Uploaded picture object
   */
  public async updateUserProfilePicture(user: User, uploadedPicture: Express.Multer.File) {

    // get the stored profile picture instance for the user
    let profilePictureInstance = await this.profilePictureRepository.findOne({ user: user });

    // if there are no profile picture instances stored for user, we create a new one and save it
    if (!profilePictureInstance) {
      const profilePicture = new ProfilePicture();
      profilePicture.user = user;
      // save profile picture instance in profile picture repository
      profilePictureInstance = await this.profilePictureRepository.save(profilePicture);
    }

    /** delete old profile pictures first */
    const deletePictures = async () => {
      /** possible image resolutions */
      const possibleResolutions = PROFILE_PICTURES_RESOLUTIONS.map((res) => res.toString());
      possibleResolutions.forEach(async resolution => {
        try {
          const picURL = PROFILE_PICTURES_FOLDER +
            `/${resolution}/${profilePictureInstance['res_' + resolution]}`;
          const picExists = await fs.pathExists
            (path.join(process.cwd(), picURL));
          if (picExists) {
            await fs.unlink(picURL);
          }
        } catch (error) {
          throw Error('Could not remove profile picture');
        }
      });
      // delete original picture
      try {
        const picURL = PROFILE_PICTURES_FOLDER + profilePictureInstance.res_original;
        const picExists = await fs.pathExists(picURL);
        if (picExists) {
          await fs.unlink(picURL);
        }
      } catch (error) {
      }
    };
    await deletePictures();

    /** rename uploaded file with a hash signature and append user ID */
    const renameFileWithHash = async () => {
      const fileHash = await UploadUtils.getFileHash(uploadedPicture.path, HashAlgorithm.SHA_256);
      try {
        const newName = `${fileHash}-${user.id}${path.extname(uploadedPicture.path)}`;
        const newPath = path.join(process.cwd(), PROFILE_PICTURES_FOLDER, newName);
        await fs.rename(uploadedPicture.path, newPath);
        // change path property
        uploadedPicture.filename = newName;
        uploadedPicture.path = newPath;
      } catch (error) {
        throw error;
      }
    };
    await renameFileWithHash();

    /** get image resolution */
    const metadata = await sharp(uploadedPicture.path).metadata();
    const imageResolution: PictureSize = { height: metadata.height, width: metadata.width };
    /** get only those resolutions we should resize */
    const newResolutions = PROFILE_PICTURES_RESOLUTIONS.filter((res) => res <= imageResolution.width);
    const resizeProfilePictures = async () => {
      for (const resolution of newResolutions) {
        const finalPath = path.join(process.cwd(), PROFILE_PICTURES_FOLDER, resolution.toString(), uploadedPicture.filename);
        try {
          await sharp(uploadedPicture.path)
            .resize(resolution, resolution, {
              position: 'centre'
            })
            .toFile(finalPath);
          this.logger.info(`Image resized (${resolution}x${resolution})`);
        } catch (error) {
          throw new Error('Error trying to resize image');
        }
        // set profile picture instance resolution path
        profilePictureInstance['res_' + resolution] =
          path.join(PROFILE_PICTURES_FOLDER, resolution.toString(), uploadedPicture.filename);
      }
    };
    await resizeProfilePictures();

    const updateResult = await this.profilePictureRepository.update({ user: user }, profilePictureInstance);
    return updateResult;
  }

  /**
   * Deletes user from database given ID
   * @param id - ID to delete from database
   * @returns DeleteResult object
   */
  public async deleteUserByID(id: number): Promise<DeleteResult> {
    const deleteResult = await this.userRepository.delete(id);
    return deleteResult;
  }

  /**
   * Check if user exists with email
   * @param userEmail - User email
   * @returns User exists
   */
  public async userExistsByEmail(userEmail: string): Promise<boolean> {
    const exists = await this.userRepository.count({ email: userEmail });
    return exists > 0;
  }

  /**
   * Check if user exists with ID
   * @param id - User ID
   * @returns User exists
   */
  public async userExistsByID(id: number): Promise<boolean> {
    const userCount: number = await this.userRepository.count({ id: id });
    return userCount > 0;
  }

  /**
   * Returns user with the ID provided
   * @param id - ID to lookup
   * @returns User entity
   */
  public async getUserByID(id: number): Promise<User> {
    return await this.userRepository.getProfile('user.id = :id', { id: id });
  }

  /**
   * Get user by email
   * @param email - Email string
   * @returns User entity
   */
  public async getUserByEmail(userEmail: string): Promise<User> {
    return await this.userRepository.getProfile('user.email = :email', { email: userEmail });
  }
}

interface PictureSize {
  width: number;
  height: number;
}
