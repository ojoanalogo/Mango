import { User } from '../models/user.model';
import { AuthService } from './auth.service';

export class UserService {
    private static readonly userModel = new User().getModel();

    static getUsers(maxUsers: number) {
        return this.userModel.find({}).select(
            'first_name second_name email user_role registered_at'
        ).limit(maxUsers);
    }

    static async createUser(user: User) {
        const userModel = await this.userModel.create(user);
        const userData = userModel.toObject();
        const tokenData = await AuthService.createJWT(user);
        tokenData ? userData.token = tokenData : userData.token = null;
        return userData;
    }

    static getUserByEmail(email: string) {
        return this.userModel.findOne({
            'email': email
        }, {});
    }

    static getUserByID(id: number) {
        return this.userModel.findOne({
            '_id': id
        }, {});
    }

    static updateUser(id: number, data: any) {

    }

    static async doesExists(email: string) {
        const usr = await this.userModel.findOne({
            'email': email
        });
        return usr;
    }
}
