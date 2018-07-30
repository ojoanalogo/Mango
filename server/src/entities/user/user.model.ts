import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Token } from '../token/token.model';
import * as bcrypt from 'bcrypt';
import { ProfilePicture } from './user_profile_picture';

export const table_name = 'users';
@Entity(table_name)
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

    @OneToMany(type => Token, token => token.owner)
    tokens: Token[];

    @OneToOne(type => ProfilePicture, profile_picture => profile_picture.user)
    profile_picture: ProfilePicture;

    @BeforeInsert()
    async doSomethingBeforeInsertion() {
        // store password as a hash
        const hash = await bcrypt.hash(this.password, 12);
        this.password = hash;
    }
    /**
     * Compare a password with the one encrypted in the database
     * @param passwordToCompare Password to check against
     */
    async comparePassword(passwordToCompare): Promise<boolean> {
        const hash = await bcrypt.compare(passwordToCompare, this.password);
        return hash;
    }
}
