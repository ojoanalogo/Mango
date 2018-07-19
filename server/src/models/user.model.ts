import { prop, Typegoose, staticMethod } from 'typegoose';
import { UserRole } from '../types/user.type';

/**
 * User Model
 */
export class User extends Typegoose {
  _id: string;
  @prop({required: true, minlength: 3, maxlength: 64})
  first_name: string;
  @prop({required: true, minlength: 3, maxlength: 120})
  second_name: string;
  @prop({required: true, unique: true, minlength: 5, maxlength: 254})
  email: string;
  @prop({required: true, unique: false, maxlength: 60})
  password: string;
  @prop({ default: UserRole.DEFAULT})
  user_role: UserRole;
  @prop({default: Date.now()})
  registered_at: Date;
  @prop({default: Date.now()})
  last_login: Date;
  @prop()
  token: string;
  /**
   * Get user model
   * @returns {User} user model
   */
  @staticMethod
  getModel() {
    return new User().getModelForClass(User);
  }
}
