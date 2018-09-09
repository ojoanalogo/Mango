import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export enum RoleType {
    CEO = 'ceo',
    CTO = 'cto',
    STAFF = 'staff',
    DEVELOPER = 'developer',
    SALES = 'sales',
    USER = 'user'
}

export const table_name = 'roles';
@Entity(table_name)
export class Role extends CUD {

    @Column({
        type: 'enum',
        enum: RoleType
    })
    role: RoleType;

    @OneToOne(type => User, user => user.role, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    user: User;
}
