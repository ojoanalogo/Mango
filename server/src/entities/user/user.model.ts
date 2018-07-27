import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('user')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    second_name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    user_role: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    registered_at: string;

    @UpdateDateColumn()
    last_login: string;

    @BeforeInsert()
    async doSomethingBeforeInsertion() {
        // store password as a hash
        const hash = bcrypt.hashSync(this.password, 12);
        this.password = hash;
    }
    /**
     * Compares database password
     * @param passwordToCompare Password to check against
     */
    async comparePassword(passwordToCompare): Promise<boolean> {
        const hash = await bcrypt.compare(passwordToCompare, this.password);
        return hash;
    }
}
