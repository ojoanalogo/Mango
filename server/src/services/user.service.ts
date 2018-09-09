import { Service, Inject } from 'typedi';
import { UpdateResult, DeleteResult } from 'typeorm';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { ProfilePictureRepository } from '../repositories/profile_picture.repository';
import { User } from '../entities/user/user.model';
import { Role, RoleType } from '../entities/user/user_role.model';
import { Token } from '../entities/token/token.model';
import { JSONUtils } from '../utils/json.utils';
import { ProfilePicture } from '../entities/user/user_profile_picture.model';
import { Logger } from './logger.service';
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
        private tokenRepository: TokenRepository,
        private jsonUtils: JSONUtils) { }

    /**
     * Returns users from database
     */
    public async findAll(): Promise<User[]> {
        try {
            const users = await
                this.userRepository.createQueryBuilder().where('is_active= :is_active', { is_active: 1 }).getMany();
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
            const tokenData = await this.authService.createJWT(userReq);
            // create JWT entity instance
            const token = new Token();
            token.token = tokenData.jwt;
            token.user = userInstance; // asign relationship
            // now we save the token in our tokenrepository
            await this.tokenRepository.save(token);
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
            log.info(`User ${userInstance.email}(ID: ${userInstance.id}) was created`);
            // pass full JWT tokens
            userInstance['tokenData'] = tokenData;
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
            console.log(user);
            const userDB = await this.userRepository.findOne({ email: user.email });
            // compares user password from login request with the one found associated to the email in the database (user Model)
            const rs = await userDB.comparePassword(user.password);
            if (rs) {
                const tokenData = await this.authService.createJWT(userDB);
                await this.userRepository.update(userDB.id, { last_login: new Date() });
                // update token in repo
                const tokenDB = await this.tokenRepository.findOne({ userId: userDB.id });
                await this.tokenRepository.update(tokenDB.id, { token: tokenData.jwt });
                // return user data with tokens (JWT & Refresh)
                userDB['tokenData'] = tokenData;
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
            if (currentPassword !== user.password) {
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
     * Returns current token associated with user
     * @param user user object
     */
    public async getToken(user: User) {
        const tokenData = await this.userRepository
            .createQueryBuilder('user')
            .select(['user.id', 'token.token'])
            .innerJoin('user.token', 'token')
            .where('user.email = :email', { email: user.email })
            .getOne();
        return tokenData;
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
