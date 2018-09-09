import { Service } from 'typedi';
import { Token, table_name } from '../entities/token/token.model';
import { BaseRepository } from '../repositories/base.repository';
import { User } from '../entities/user/user.model';

@Service()
export class TokenRepository extends BaseRepository<Token> {
    constructor() {
        super(table_name);
    }

    /**
     * Returns token associated to user based on ID
     * @param userID user ID
     */
    async getToken(userID: number) {
        return await this.createQueryBuilder('token')
            .innerJoin('token.user', 'user')
            .where('user.id = :id', { id: userID })
            .select('token.token')
            .getOne();
    }
    /**
     * Returns user associated to token
     * @param token Token to look for
     */
    async findUserByToken(token): Promise<User> {
        const data = await this.createQueryBuilder('token')
            .leftJoinAndSelect('token.user', 'user')
            .where('token.token = :token', { token: token })
            .getOne();
        return data.user;
    }
}
