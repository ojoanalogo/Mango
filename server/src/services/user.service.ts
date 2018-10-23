import { Service, Inject } from 'typedi';
import { UpdateResult, DeleteResult } from 'typeorm';
import { UserRepository } from '../repositories/user.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { ProfilePictureRepository } from '../repositories/profile_picture.repository';
import { User } from '../entities/user/user.model';
import { Role, RoleType } from '../entities/user/user_role.model';
import { JSONUtils } from '../utils/json.utils';
import { ProfilePicture } from '../entities/user/user_profile_picture.model';
import { Logger } from '../utils/logger.util';
import { Redis } from '../database/redis';
import { JWTService } from './jwt.service';
import { UploadUtils } from '../utils/upload.utils';
import * as gm from 'gm';
import * as fs from 'fs';
import * as path from 'path';

const log = Logger.getInstance().getLogger();
@Service()
export class UserService {

    @Inject(type => JWTService)
    private jwtService: JWTService; // circular reference fix
    constructor(
        private userRepository: UserRepository,
        private profilePictureRepository: ProfilePictureRepository,
        private rolesRepository: RolesRepository,
        private jsonUtils: JSONUtils,
        private redisService: Redis) { }

    /**
     * Returns users from database
     */
    public async findAll(page: number = 0): Promise<User[]> {
        const redis = await this.redisService.getRedisInstance();
        try {
            let toSkip: number = page * 100;
            if (page === 1) {
                toSkip = 0;
            }
            const users = await
                this.userRepository.createQueryBuilder().where('is_active= :is_active', { is_active: 1 })
                    .skip(toSkip)
                    .take(100)
                    .getMany();
            redis.setex('api:getUsers/' + page, 5, JSON.stringify(users));
            console.log('no deeria salir en cached data');
            return this.jsonUtils.filterDataFromObjects(users, this.jsonUtils.commonUserProperties);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates a new user
     * @param user user object
     */
    public async createUser(userReq: User): Promise<User> {
        // create User
        try {
            const user = new User();
            user.email = userReq.email;
            user.password = userReq.password;
            const userInstance = await this.userRepository.save(userReq);
            // create JWT tokens
            const jwtToken = await this.jwtService.createJWT(userInstance);
            // create profile picture entity
            const profilePicture = new ProfilePicture();
            profilePicture.user = userInstance;
            // save profile picture in profile picture repository
            await this.profilePictureRepository.save(profilePicture);
            // now assign default Role
            const role = new Role();
            role.role = RoleType.USER;
            role.user = userInstance;
            // save role in role repository
            await this.rolesRepository.save(role);
            // pass full JWT tokens
            userInstance.token = jwtToken;
            log.info(`User ${userInstance.email}(ID: ${userInstance.id}) was created`);
            // return user model object
            return this.jsonUtils.filterDataFromObject(userInstance, this.jsonUtils.commonUserProperties);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Checks user credentials and validates him
     * @param user user object
     */
    public async loginUser(user: User): Promise<any> {
        try {
            const userDB = await this.userRepository.findOne({ email: user.email });
            // compares user password from login request with the one found associated to the email in the database (user Model)
            const rs = await userDB.comparePassword(user.password);
            if (rs) {
                await this.userRepository.update(userDB.id, { last_login: new Date() });
                // update token in repo
                const jwtToken = await this.jwtService.createJWT(userDB);
                // return user data with token
                userDB.token = jwtToken;
                // return user model object
                return this.jsonUtils.filterDataFromObject(userDB, this.jsonUtils.commonUserProperties);
            } else {
                // wrong password mate
                return false;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user data in database
     * @param user user object
     */
    public async updateUser(user: User): Promise<UpdateResult> {
        try {
            const userDB = await this.userRepository.findOne({ id: user.id });
            const currentPassword = userDB.password;
            if (user.password && currentPassword !== user.password) {
                await user.updatePassword();
                log.info(`User (ID: ${userDB.id}) updated his password`);
            }
            const userUpdated = await this.userRepository.update(userDB.id, user);
            log.info(`User (ID: ${userDB.id}) was updated`);
            return userUpdated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile picture in database
     * @param user user object
     * @param uploadedPicture picture object (file data)
     */
    public async updateUserProfilePicture(user: User, uploadedPicture: any): Promise<any> {
        try {
            const userDB = await this.userRepository.findOne({ email: user.email });
            const profilePictureInstance = await this.profilePictureRepository.findOne({ userId: userDB.id });
            const resolutions = ['480', '240', '96', '64', '32']; // picture resolutions
            // delete original file
            const originalFilePath = path.join(__dirname, '../../' +
                profilePictureInstance.res_original);
            if (fs.existsSync(originalFilePath)) {
                fs.unlinkSync(originalFilePath);
            }
            // delete old files if they exist
            resolutions.forEach(resolution => {
                if (profilePictureInstance['res_' + resolution]) {
                    const fileResPath =
                        path.join(__dirname, '../../' + profilePictureInstance['res_' + resolution]);
                    if (fs.existsSync(fileResPath)) {
                        fs.unlinkSync(fileResPath);
                    }
                    profilePictureInstance['res_' + resolution] = null;
                }
            });
            // rename uploaded file with hash signature
            const hash = await UploadUtils.getFileHash(uploadedPicture.path, 'sha256');
            const newPicName = hash + path.extname(uploadedPicture.path);
            const newPicPath = path.join(__dirname, '../../uploads/profile_pictures/'
                + newPicName);
            fs.renameSync(uploadedPicture.path, newPicPath);
            // convert $FILENAME -auto-orient +profile "*" -write \
            // "mpr:source" -resize "1080x1080^" -gravity center -crop "1080x1080+0+0" +repage -write "$NAME-1080.jpg" +delete \
            // "mpr:source" "$NAME-original.jpg"
            // we should only resize file to lower resolutions
            gm(newPicPath).size(async (err, dimensions) => {
                if (err) {
                    throw err;
                }
                const newResolutions = resolutions.filter((val) => parseInt(val) <= dimensions.width);
                newResolutions.forEach(resElement => {
                    const resolution = parseInt(resElement);
                    const finalFileNameWithDir = path.join(__dirname, '../../uploads/profile_pictures/' + resElement + '/' + newPicName);
                    gm(newPicPath)
                        .resize(resolution, resolution, '^')
                        .gravity('Center')
                        .crop(resolution, resolution, 0, 0)
                        .repage('+')
                        .noProfile()
                        .write(finalFileNameWithDir, (error) => {
                            if (!error) {
                                log.info('Image resized');
                            } else {
                                throw new Error('Error trying to resize image');
                            }
                        });
                    // assign new URL with res name
                    profilePictureInstance['res_' + resElement] = '/uploads/profile_pictures/' + resElement + '/' + newPicName;
                });
                profilePictureInstance.res_original = '/uploads/profile_pictures/' + newPicName;
                const updateResult = await this.profilePictureRepository.update({ userId: userDB.id }, profilePictureInstance);
                setTimeout(() => {
                    // rename original picture
                    fs.renameSync(newPicPath, path.join(__dirname,
                        '../../uploads/profile_pictures/' + newPicName));
                }, 200);
                return updateResult;
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes user from database given ID
     * @param id ID to delete from database
     */
    public async deleteUserByID(id: number): Promise<DeleteResult> {
        try {
            const deleteResult = await this.userRepository.delete(id);
            return deleteResult;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Returns user with the ID provided
     * @param id ID to lookup
     */
    public async getUserByID(id: number): Promise<User> {
        try {
            return await this.userRepository.getProfile('user.id = :id', { id: id });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user by email
     * @param email email string
     */
    public async getUserByEmail(userEmail: string): Promise<User> {
        try {
            return await this.userRepository.getProfile('user.email = :email', { email: userEmail });
        } catch (error) {
            throw error;
        }
    }
}
