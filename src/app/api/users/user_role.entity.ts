import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CUID } from '../common/CUID';
import { User } from './user.entity';

export enum RoleType {
  CEO = 'ceo',
  CTO = 'cto',
  DEVELOPER = 'developer',
  STAFF = 'staff',
  SALES = 'sales',
  USER = 'user'
}

@Entity('roles')
export class Role extends CUID {

  @Column({
    type: 'enum',
    enum: RoleType
  })
  public role: RoleType;

  @OneToOne(() => User, user => user.role, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn()
  public user: User;
}

/**
 * Returns weight for the user role
 * @param role - RoleType
 */
export const getWeight = (role: RoleType): number => {
  const weight = {
    'ceo': 1000,
    'cto': 999,
    'developer': 666,
    'staff': 150,
    'sales': 100,
    'user': 1
  };
  return weight[role] !== undefined ? weight[role] : 1;
};
