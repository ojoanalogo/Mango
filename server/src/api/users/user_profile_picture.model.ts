import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { CUID } from '../common/CUID';

@Entity('users_profile_pictures')
export class ProfilePicture extends CUID {

  @Column({ nullable: true })
  res_original: string;
  @Column({ nullable: true })
  res_480: string;
  @Column({ nullable: true })
  res_240: string;
  @Column({ nullable: true })
  res_96: string;
  @Column({ nullable: true })
  res_64: string;
  @Column({ nullable: true })
  res_32: string;
  @OneToOne(() => User, user => user.profile_picture, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn()
  user: User;
}
