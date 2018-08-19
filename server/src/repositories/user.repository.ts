import { Service } from 'typedi';
import { User, table_name } from '../entities/user/user.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(table_name);
    }

    getProfile(userEmail: string) {
        return this.findOne({
            email: userEmail,
            join: {
                alias: 'user',
                leftJoinAndSelect: {
                    profile: 'user.profile_picture'
                }
            }
        });
    }
}
