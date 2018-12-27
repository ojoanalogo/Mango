import { CreateDateColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * Abstract class for Created, updated and Deleted at columns with ID field
 */
export abstract class CUD {

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('timestamp', {nullable: true})
    deleted_at: Date;
}
