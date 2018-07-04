import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

export class User extends Typegoose {
  @prop({required: true})
  first_name: string;
  @prop({required: true})
  second_name: string;
  @prop({required: true})
  email: string;
  // @prop({required: true, min: 64, max: 64})
  // password: string;
  @prop()
  registered_at: Date;
  @prop()
  last_login: Date;
}
