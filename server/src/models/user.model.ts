import { prop, Typegoose, staticMethod } from 'typegoose';
import { UserRole } from '../types/user.type';

/**
 * User Model
 */
export class User extends Typegoose {
  @prop({required: true})
  first_name: string;
  @prop({required: true})
  second_name: string;
  @prop({required: true, unique: true})
  email: string;
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
