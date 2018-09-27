import { Entity, Column, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export const table_name = 'tokens';
@Entity(table_name)
export class Token extends CUD {

    @Column()
    token: string;

    @CreateDateColumn()
    issued_at: Date;

    @Column()
    expiration: Date;

    @CreateDateColumn()
    last_time_used: Date;

    @Column()
    agent: string;

    @ManyToOne(type => User, user => user.token, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
