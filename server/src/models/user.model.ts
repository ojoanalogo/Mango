import { prop, Typegoose, staticMethod } from 'typegoose';

export class User extends Typegoose {
  @prop({required: true})
  first_name: string;
  @prop({required: true})
  second_name: string;
  @prop({required: true, unique: true})
  email: string;
  @prop({default: Date.now()})
  registered_at: Date;
  @prop({default: Date.now()})
  last_login: Date;
  @staticMethod
  getModel() {
    return new User().getModelForClass(User);
  }
}

