import { User } from '../models/user.model';

export class UserService {
    private static readonly userModel = new User().getModel();

    static getUsers(maxUsers: number) {
        return this.userModel.find({}).select(
            'first_name second_name email registered_at'
        ).limit(maxUsers);
    }

    static createUser(user: User) {
        return this.userModel.create(user);
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

}
