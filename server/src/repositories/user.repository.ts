import { Service } from 'typedi';
import { User, table_name } from '../entities/user/user.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(table_name);
    }

    /**
     * Get user profile from database
     * @param conditions conditions like email = :email
     * @param conditionsValues value for conditions
     */
    async getProfile(conditions: string, conditionsValues: any): Promise<User> {
        return await this.createQueryBuilder('user')
            .select(['user.id', 'user.email', 'user.first_name',
                'user.second_name', 'user.last_login', 'profile_picture.url', 'role.role'])
            .leftJoin('user.role', 'role')
            .leftJoin('user.profile_picture', 'profile_picture')
            .where(conditions, conditionsValues)
            .getOne();
    }
}
