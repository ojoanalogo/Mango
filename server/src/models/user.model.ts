import { prop, Typegoose, staticMethod } from 'typegoose';
import { UserRole } from '../types/user.type';

/**
 * User Model
 */
export class User extends Typegoose {
  // main ID for user object
  _id: string;
  // user first name
  @prop({required: true, minlength: 3, maxlength: 64})
  first_name: string;
  // user second name
  @prop({required: true, minlength: 3, maxlength: 120})
  second_name: string;
  // user email
  @prop({required: true, unique: true, minlength: 5, maxlength: 254})
  email: string;
  // user password (hashed)
  @prop({required: true, unique: false, maxlength: 60})
  password: string;
  // user role (see UserRole)
  @prop({ default: UserRole.DEFAULT})
  user_role: UserRole;
  // user register date
  @prop({default: Date.now()})
  registered_at: Date;
  // user last login
  @prop({default: Date.now()})
  last_login: Date;
  // user JWT token
  @prop()
  token: string;
  // is User enabled?
  @prop({default: true})
  is_enabled: boolean;
  /**
   * Get user model
   * @returns {User} user model
   */
  @staticMethod
  getModel() {
    return new User().getModelForClass(User);
  }
}
