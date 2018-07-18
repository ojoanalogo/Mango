import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { DocumentQuery } from 'mongoose';

export class UserService {

    // user model from database
    private static readonly userModel = new User().getModel();

    /**
     * Returns users from database
     * @param maxUsers how many users will be returned
     */
    static getUsers(maxUsers: number) {
        return this.userModel.find({}).select(
            'first_name second_name email user_role registered_at'
        ).limit(maxUsers);
    }

    /**
     * Create a new user from database
     * @param user user object
     */
    static async createUser(user: User) {
        const userModel = await this.userModel.create(user);
        const userData = userModel.toObject();
        const tokenData = await AuthService.createJWT(user);
        tokenData ? userData.token = tokenData : userData.token = null;
        return userData;
    }

    /**
     * Update user by ID
     * @param id ID string
     * @param user User User
     */
    static async updateUserById(id: string, user: User) {
        return this.userModel.updateOne({'_id': id}, user);
    }

    /**
     * Get user by email
     * @param email email string
     */
    static getUserByEmail(email: string) {
        return this.userModel.findOne({
            'email': email
        }, {});
    }

    /**
     * Get user by ID
     * @param id ID string
     */
    static getUserByID(id: string) {
        return this.userModel.findOne({
            '_id': id
        }, {});
    }

    /**
     * Cheks whether user exists or not
     * @param email email from user
     */
    static async doesExists(email: string) {
        const usr = await this.userModel.findOne({
            'email': email
        });
        return usr;
    }
}
