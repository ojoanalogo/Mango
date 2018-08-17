import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export const table_name = 'tokens';
@Entity(table_name)
export class Token extends CUD {
    @Column()
    token: string;
    @Column()
    expires: Date;
    @ManyToOne(type => User, user => user.tokens)
    user: User;
}
