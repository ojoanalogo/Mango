import { CreateDateColumn, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Abstract class for Created, updated and Deleted at columns with ID field
 */
export abstract class CUID {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;
}
