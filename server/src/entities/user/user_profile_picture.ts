import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export const table_name = 'user_profile_pictures';
@Entity(table_name)
export class ProfilePicture extends CUD {
    @Column()
    url: string;
    @OneToOne(type => User, user => user.profile_picture)
    @JoinColumn()
    user: User;
}
