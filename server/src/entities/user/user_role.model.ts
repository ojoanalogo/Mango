import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.model';
import { CUD } from '../CUD';

export enum RoleType {
    CEO = 'ceo',
    CTO = 'cto',
    DEVELOPER = 'developer',
    STAFF = 'staff',
    SALES = 'sales',
    USER = 'user'
}

export function getWeight(role: RoleType) {
    const weight = {
        'ceo' : 1000,
        'cto' : 999,
        'developer': 666,
        'staff': 100,
        'sales': 100,
        'user': 1
    };
    return weight[role];
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
