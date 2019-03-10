import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Abstract class for Created, updated and Deleted at columns with ID field
 */
export abstract class CUD {

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;

  @Column('timestamp', { nullable: true })
  public deleted_at: Date;
}
