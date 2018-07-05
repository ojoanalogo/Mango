import { prop, Typegoose, ModelType, InstanceType, staticMethod } from 'typegoose';

export class User extends Typegoose {
  @prop({index: true})
  id: number;
  @prop()
  first_name: string;
  @prop()
  second_name: string;
  @prop()
  email: string;
  @prop()
  registered_at: Date;
  @prop()
  last_login: Date;
  @staticMethod
  getModel() {
    return new User().getModelForClass(User);
  }
}

