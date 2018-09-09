import { Service } from 'typedi';
import { Role, table_name } from '../entities/user/user_role.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class RolesRepository extends BaseRepository<Role> {
    constructor() {
        super(table_name);
    }
}

