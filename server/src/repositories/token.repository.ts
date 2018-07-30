import { Service } from 'typedi';
import { Token, table_name } from '../entities/token/token.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class TokenRepository extends BaseRepository<Token> {
    constructor() {
        super(table_name);
    }
}
