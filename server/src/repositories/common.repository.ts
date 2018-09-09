import { Service } from 'typedi';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class CommonRepository extends BaseRepository<any> {
    constructor() {
        super();
    }
}
