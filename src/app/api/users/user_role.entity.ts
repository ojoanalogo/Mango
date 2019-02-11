import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { CUID } from '../common/CUID';

export enum RoleType {
  CEO = 'ceo',
  CTO = 'cto',
  DEVELOPER = 'developer',
  STAFF = 'staff',
  SALES = 'sales',
  USER = 'user'
}

/**
 * Returns weight for the user role
 * @param role - RoleType
 */
export function getWeight(role: RoleType) {
  const weight = {
    'ceo': 1000,
    'cto': 999,
    'developer': 666,
    'staff': 150,
    'sales': 100,
    'user': 1
  };
  return weight[role] !== undefined ? weight[role] : 1;
}

@Entity('roles')
export class Role extends CUID {

  @Column({
    type: 'enum',
    enum: RoleType
  })
  role: RoleType;

  @OneToOne(() => User, user => user.role, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  user: User;
}
