import { Service } from 'typedi';
import { ProfilePicture, table_name } from '../entities/user/user_profile_picture.model';
import { BaseRepository } from '../repositories/base.repository';

@Service()
export class ProfilePictureRepository extends BaseRepository<ProfilePicture> {
    constructor() {
        super(table_name);
    }
}

