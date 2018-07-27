import { Service } from 'typedi';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user/user.model';
import { JSONUtils } from '../utils/json.utils';
import { AuthService } from './auth.service';

@Service()
export class UserService {

    constructor(private userRepository: UserRepository, private authService: AuthService, private jsonUtils: JSONUtils<User>) { }

    /**
     * Returns users from database
     */
    public async findAll(): Promise<User[]> {
        const users: User[] = await this.userRepository.getAll();
        return this.jsonUtils.filterDataFromObjects(users, this.jsonUtils.commonUserProperties);
    }

    /**
     * Creates a new user
     * @param user user object
     */
    public async createUser(userReq: User): Promise<User> {
        // create JWT tokens
        const tokenData = await this.authService.createJWT(userReq);
        // create User
        try {
            const user = new User();
            user.email = userReq.email;
            user.password = userReq.password;
            const userInstance = await this.userRepository.save(user);
            // pass full JWT tokens
            userInstance['tokenData'] = tokenData;
            // return user model object
            return this.jsonUtils.filterDataFromObject(userInstance, this.jsonUtils.commonUserProperties);
        } catch (error) {
            throw new Error('Can\'nt create user instance in database');
        }
    }

    /**
     * Checks user credentials and validates him
     * @param user user Object
     */
    public async loginUser(user: User): Promise<any> {
        const userDB = await this.getUserByEmail(user.email);
        // compares user password from login request with the one found associated to the email in the database (user Model)
        const rs = await userDB.comparePassword(user.password);
        if (rs) {
            const tokenData = await this.authService.createJWT(userDB);
            // await this.userRepository.getQueryBuilder().update(userDB).
            //     set({ last_login: new Date() }).where('id = :id', { id: userDB.id }).execute();
            await this.userRepository.update(userDB.id, {last_login: new Date()});
            // return user data with tokens
            userDB['tokenData'] = tokenData;
            // return user model object
            return this.jsonUtils.filterDataFromObject(userDB, this.jsonUtils.commonUserProperties);
        } else {
            // wrong password mate
            return false;
        }
    }

    /**
     * Update user data in database
     * @param user user parameters
     */
    public async updateUser(user: User) {
        try {
            const userDB = await this.userRepository.findOne({ id: user.id });
            return await this.userRepository.update(userDB.id, user);
        } catch (error) {
            throw new Error(error.msg);
        }
    }

    /**
     * Returns user with the ID provided
     * @param id id to lookup
     */
    public async getUserByID(id: number): Promise<User> {
        const options = { id: id };
        return await this.userRepository.findOne(options);
    }

    /**
     * Get user by email
     * @param email email string
     */
    public async getUserByEmail(email: string, dataFiltered?: boolean): Promise<User> {
        const options = { email: email };
        const userData = await this.userRepository.findOne(options);
        if (dataFiltered) {
            return this.jsonUtils.filterDataFromObject(userData, this.jsonUtils.commonUserProperties);
        } else {
            return userData;
        }
    }

    /**
     * Cheks whether user exists or not using email
     * @param userEmail email from user
     */
    public async doesExistsEmail(userEmail: string): Promise<boolean> {
        const options = { email: userEmail };
        const userData = await this.userRepository.findOne(options);
        if (!userData) {
            return false;
        }
        return true;
    }
}
