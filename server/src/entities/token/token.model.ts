import { Entity, Column, JoinColumn, UpdateDateColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export const table_name = 'tokens';
@Entity(table_name)
export class Token extends CUD {

    @Column()
    refresh_token: string;

    @CreateDateColumn()
    last_time_used: Date;

    @Column()
    user_agent: string;

    @ManyToOne(type => User, user => user.refresh_token, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
