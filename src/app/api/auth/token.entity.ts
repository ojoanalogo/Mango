import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tokens')
export class Token {

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
