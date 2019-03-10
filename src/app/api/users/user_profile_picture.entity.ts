import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CUID } from '../common/CUID';
import { User } from './user.entity';

@Entity('users_profile_pictures')
export class ProfilePicture extends CUID {

  @Column({ nullable: true })
  public res_original: string;

  @Column({ nullable: true })
  public res_480: string;

  @Column({ nullable: true })
  public res_240: string;

  @Column({ nullable: true })
  public res_96: string;

  @Column({ nullable: true })
  public res_64: string;

  @Column({ nullable: true })
  public res_32: string;

  @OneToOne(() => User, user => user.profile_picture, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn()
  public user: User;

}
