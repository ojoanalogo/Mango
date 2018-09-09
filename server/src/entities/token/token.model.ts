import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export const table_name = 'tokens';
@Entity(table_name)
export class Token extends CUD {

    @Column()
    token: string;

    @OneToOne(type => User, user => user.token, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
