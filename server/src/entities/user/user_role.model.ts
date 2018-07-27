import {Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_role')
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
}
