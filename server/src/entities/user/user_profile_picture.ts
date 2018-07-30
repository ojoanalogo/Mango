import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.model';

export const table_name = 'user_profile_pictures';
@Entity(table_name)
export class ProfilePicture {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    url: string;
    @ManyToOne(type => User, user => user.profile_picture)
    user: User;
}
