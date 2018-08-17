import { Entity, Column, BeforeInsert, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Token } from '../token/token.model';
import { ProfilePicture } from './user_profile_picture';
import { CUD } from '../CUD';
import * as bcrypt from 'bcrypt';

export const table_name = 'users';
@Entity(table_name)
export class User extends CUD {

    @Column()
    first_name: string;

    @Column()
    second_name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    is_active: boolean;

    @UpdateDateColumn()
    last_login: string;

    @OneToMany(type => Token, token => token.user)
    tokens: Token[];

    @OneToOne(type => ProfilePicture, profile_picture => profile_picture.user)
    profile_picture: ProfilePicture;

    @BeforeInsert()
    async doSomethingBeforeInsertion() {
        // store password as a hash
        try {
            const hash = await bcrypt.hash(this.password, 12);
            this.password = hash;
        } catch (error) {
            throw error;
        }
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
