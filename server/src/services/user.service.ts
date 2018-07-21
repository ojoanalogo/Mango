import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { JSONUtils } from '../utils/json.utils';
import * as bcrypt from 'bcrypt';

export class UserService {

    // user model from database
    private static readonly userModel = new User().getModel();
    private static commonProperties =
    ['user_role', 'registered_at', 'email_validated', '_id', 'email', 'first_name', 'second_name', 'token'];

    /**
     * Returns users from database
     * @param maxUsers how many users will be returned
     */
    static getUsers(maxUsers: number) {
        return this.userModel.find({ 'is_enabled': true }).select(
            'first_name second_name email user_role registered_at last_login'
        ).limit(maxUsers);
    }

    /**
     * Creates a new user
     * @param user user object
     */
    static async createUser(user: User) {
        // create JWT tokens
        const tokenData = await AuthService.createJWT(user);
        tokenData ? user.token = tokenData.jwt : user.token = '';
        // encrypt password
        const passData = await bcrypt.hash(user.password, 12);
        user.password = passData;
        // finaly create user
        const userModel = await this.userModel.create(user);
        // pass full JWT tokens
        const userData = userModel.toObject();
        userData.token = tokenData;
        // return user model object
        // this removes unwanted keys from JSON
        return JSONUtils.filterDataFromObject(userData, this.commonProperties);
    }

    /**
     * Checks user credentials and validates him
     * @param user user Object
     */
    static async loginUser(user: User) {
        const userModel = await this.userModel.findOne({ 'email': user.email, 'is_enabled': true });
        // compares user password from login request with the one found associated to the email in the database (user Model)
        const rs = await bcrypt.compare(user.password, userModel.password);
        if (rs) {
            const tokenData = await AuthService.createJWT(user);
            await this.userModel.updateOne({ '_id': userModel._id }, { 'last_login': Date.now(), 'token': tokenData.jwt });
            // return user data with tokens
            const userData = userModel.toObject();
            userData.token = tokenData;
            // return user model object
            // this removes unwanted keys from JSON
            return JSONUtils.filterDataFromObject(userData, this.commonProperties);
        } else {
            // wrong password mate
            return false;
        }
    }

    /**
     * Update user by ID
     * @param id ID string
     * @param user user object
     */
    static async updateUserById(id: string, user: User) {
        const userData = await this.userModel.updateOne({ '_id': id }, user);
        return userData;
    }

    /**
     * Get user by email
     * @param email email string
     */
    static getUserByEmail(email: string) {
        return this.userModel.findOne({
            'email': email
        }).select('_id user_role registered_at first_name second_name email');
    }

    /**
     * Get user by ID
     * @param id ID string
     */
    static getUserByID(id: string) {
        return this.userModel.findOne({
            '_id': id
        }).select('_id user_role registered_at first_name second_name email');
    }

    /**
     * Get user token from database
     * @param id ID string
     */
    static getUserToken(id: string) {
        return this.userModel.findOne({
            '_id': id
        }).select('token');
    }

    /**
     * Cheks whether user exists or not using email
     * @param email email from user
     */
    static async doesExistsEmail(email: string) {
        const usr = await this.userModel.findOne({
            'email': email
        });
        return usr;
    }

    /**
     * Cheks whether user exists or not using ID
     * @param id email from user
     */
    static async doesExistsId(id: string) {
        const usr = await this.userModel.findOne({
            '_id': id
        });
        return usr;
    }
}
