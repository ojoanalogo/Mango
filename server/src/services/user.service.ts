import { User } from '../models/user.model';
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
    }

}
