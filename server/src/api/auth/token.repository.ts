import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { JwtToken } from './token.model';

@Service()
@EntityRepository(JwtToken)
export class TokenRepository extends Repository<JwtToken> {

  /**
   * Returns user data associated to token
   * @param token - Token to look for
   * @returns Token entity with user entity loaded
   */
  public async getTokenWithUser(token: string): Promise<JwtToken> {
    return await this.createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();
  }
}

