<<<<<<< HEAD
import { prop, Typegoose, ModelType, InstanceType, staticMethod } from 'typegoose';

export class User extends Typegoose {
  @prop({index: true})
  id: number;
  @prop()
=======
import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

export class User extends Typegoose {
  @prop({required: true})
>>>>>>> ea77462352e4c6feb2052119d1602e2ff19d8318
  first_name: string;
  @prop({required: true})
  second_name: string;
  @prop({required: true})
  email: string;
  @prop()
  registered_at: Date;
  @prop()
  last_login: Date;
<<<<<<< HEAD
  @staticMethod
  getModel() {
    return new User().getModelForClass(User);
  }
}

=======
}
>>>>>>> ea77462352e4c6feb2052119d1602e2ff19d8318
