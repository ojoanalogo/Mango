import {Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export const table_name = 'user_roles';
@Entity('user_roles')
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
}
