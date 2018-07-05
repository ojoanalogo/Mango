import { User } from '../models/user.model';
<<<<<<< HEAD

export class UserService {
    private static readonly userModel = new User().getModel();

    static getUsers(maxUsers: number) {
        return this.userModel.find({}).select(
            'first_name second_name email registered_at'
        ).limit(maxUsers);
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
=======
import { ModelType } from 'typegoose';

export class UserService {

    private readonly userModel = new User().getModelForClass(User);

    async createUser() {
        const u = new this.userModel({
          first_name: 'Alfonso',
          second_name: 'Reyes',
          email: 'arc980103@gmail.com',
          registered_at: Date.now()
        });
        return await u.save();
    }

    async getUsers() {
        return await this.userModel.find({});
>>>>>>> ea77462352e4c6feb2052119d1602e2ff19d8318
    }

}
