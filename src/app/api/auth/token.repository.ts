import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Token } from './token.entity';

@Service()
@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {

  /**
   * Returns user data associated to token
   * @param token - Token to look for
   * @returns Token entity with user entity loaded
   */
  public async getTokenWithUser(token: string): Promise<Token> {
    return await this.createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();
  }
}

