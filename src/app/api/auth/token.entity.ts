import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tokens')
export class Token {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public token: string;

  @CreateDateColumn()
  public issued_at: Date;

  @UpdateDateColumn()
  public last_time_refreshed: Date;

  @Column()
  public agent: string;

  @ManyToOne(() => User, user => user.token, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn()
  public user: User;
}
