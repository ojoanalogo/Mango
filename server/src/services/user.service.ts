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
import { AuthService } from './auth.service';

const log = Logger.getInstance().getLogger();
@Service()
export class UserService {

    @Inject(type => AuthService)
    private authService: AuthService; // circular reference fix
    constructor(
        private userRepository: UserRepository,
        private profilePictureRepository: ProfilePictureRepository,
        private rolesRepository: RolesRepository,
        private jsonUtils: JSONUtils) { }

    /**
     * Returns users from database
     */
    public async findAll(page: number = 0): Promise<User[]> {
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
            return this.jsonUtils.filterDataFromObjects(users, this.jsonUtils.commonUserProperties);
        } catch (error) {
            throw new Error(error);
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
            const jwtToken = await this.authService.createJWT(userInstance);
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
            throw new Error(error);
        }
    }

    /**
     * Checks user credentials and validates him
     * @param user user Object
     */
    public async loginUser(user: User): Promise<any> {
        try {
            const userDB = await this.userRepository.findOne({ email: user.email });
            // compares user password from login request with the one found associated to the email in the database (user Model)
            const rs = await userDB.comparePassword(user.password);
            if (rs) {
                await this.userRepository.update(userDB.id, { last_login: new Date() });
                // update token in repo
                const jwtToken = await this.authService.createJWT(userDB);
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
                log.info(`User (ID: ${userDB.id}) has updated his password`);
            }
            const userUpdated = await this.userRepository.update(userDB.id, user);
            log.info(`User (ID: ${userDB.id}) was updated`);
            return userUpdated;
        } catch (error) {
            throw new Error(error);
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
            throw new Error(error);
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
            throw new Error(error);
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
            throw new Error(error);
        }
    }
}
