import { Entity, Column, JoinColumn, ManyToOne, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.model';

export const table_name = 'tokens';
@Entity(table_name)
export class Token {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column()
    last_time_used: Date;

    @CreateDateColumn()
    issued_at: Date;

    @UpdateDateColumn()
    last_time_refreshed: Date;

    @Column()
    agent: string;

    @ManyToOne(type => User, user => user.token, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn()
    user: User;
}
