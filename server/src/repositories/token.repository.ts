import { Service } from 'typedi';
import { Token, table_name } from '../entities/token/token.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class TokenRepository extends BaseRepository<Token> {
    constructor() {
        super(table_name);
    }
    /**
     * Returns user data associated to token
     * @param token - Token to look for
     * @returns Token entity with user entity loaded
     */
    async getTokenWithUser(token): Promise<Token> {
        return await this.createQueryBuilder('token')
            .leftJoinAndSelect('token.user', 'user')
            .where('token.token = :token', { token: token })
            .getOne();
    }
}
