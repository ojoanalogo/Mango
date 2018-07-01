import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import * as mongoose from 'mongoose';

export class IUser extends Typegoose {
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

export class User {
  private userModel;
  constructor() {
    this.userModel = new IUser().getModelForClass(IUser);
  }
  async createUser(user: IUser): Promise<any> {
    const uData = new this.userModel(user);
    return await uData.save();
  }
}
