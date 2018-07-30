import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.model';

export const table_name = 'tokens';
@Entity(table_name)
export class Token {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    token: string;
    @Column()
    expires: Date;
    @ManyToOne(type => User, user => user.tokens)
    owner: User;
}
