import { Entity, Column, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.model';

@Entity('tokens')
export class JwtToken {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @CreateDateColumn()
  issued_at: Date;

  @UpdateDateColumn()
  last_time_refreshed: Date;

  @Column()
  agent: string;

  @ManyToOne(() => User, user => user.token, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn()
  user: User;
}
