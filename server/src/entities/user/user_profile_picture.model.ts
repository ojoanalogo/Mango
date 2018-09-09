import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { CUD } from '../CUD';

export const table_name = 'users_profile_pictures';
@Entity(table_name)
export class ProfilePicture extends CUD {

    @Column({nullable: true})
    url: string;

    @OneToOne(type => User, user => user.profile_picture, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
