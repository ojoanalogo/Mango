import { Service } from 'typedi';
import { User } from '../entities/user/user.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User.name.toLowerCase());
    }
}
