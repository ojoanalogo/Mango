import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { CUD } from '../CUD';

export const table_name = 'users_profile_pictures';
@Entity(table_name)
export class ProfilePicture extends CUD {

    @Column({ nullable: true })
    res_original: string;
    @Column({ nullable: true })
    res_1080: string;
    @Column({ nullable: true })
    res_540: string;
    @Column({ nullable: true })
    res_360: string;
    @Column({ nullable: true })
    res_240: string;
    @Column({ nullable: true })
    res_120: string;
    @OneToOne(type => User, user => user.profile_picture, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
