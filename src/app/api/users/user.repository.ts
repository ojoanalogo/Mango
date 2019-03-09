import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  /**
   * Get user profile from database
   * @param conditions - Conditions like email = :email
   * @param conditionsValues - Value for conditions ({email: 'bla'})
   * @returns User profile entity
   */
  public async getProfile(conditions: string, conditionsValues: any): Promise<User> {
    return await this.createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .leftJoin('user.profile_picture', 'profile_picture')
      .select(['user.id', 'user.email', 'user.first_name',
        'user.second_name',
        'profile_picture.res_480', 'profile_picture.res_240', 'profile_picture.res_96',
        'profile_picture.res_64', 'profile_picture.res_32', 'role.role'])
      .where(conditions, conditionsValues)
      .getOne();
  }
}
