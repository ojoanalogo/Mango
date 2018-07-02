import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import * as mongoose from 'mongoose';

export class User extends Typegoose {
  @prop({_id: true, index: true})
  id: number;
  @prop()
  first_name: string;
  @prop()
  second_name: string;
  @prop()
  email: string;
  // @prop({required: true, min: 64, max: 64})
  // password: string;
  @prop()
  registered_at: Date;
  @prop()
  last_login: Date;
  constructor(first_name?: string, second_name?: string, email?: string) {
    super();
    this.first_name = first_name;
    this.second_name = second_name;
    this.email = email;
  }
}

export class UserModel {

  private userModel: mongoose.Model<InstanceType<User>>;

  constructor() {
    this.userModel = new User().getModelForClass(User);
  }

  createUser() {
    const u = new this.userModel(new User('Roberto', 'Reyes', 'arc980103@gmail.com'));
    return u.save();
  }

  getUsers() {
    return this.userModel.find({}, (error, res) => {
      console.dir(res);
    });
  }
}
