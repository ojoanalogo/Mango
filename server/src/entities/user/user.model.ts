import { Entity, Column, BeforeInsert, UpdateDateColumn, OneToOne, BeforeUpdate, OneToMany } from 'typeorm';
import { Token } from '../token/token.model';
import { ProfilePicture } from './user_profile_picture.model';
import { Role } from './user_role.model';
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
    last_login: Date;

    @OneToMany(type => Token, token => token.user)
    refresh_token: Token;

    @OneToOne(type => Role, role => role.user)
    role: Role;

    @OneToOne(type => ProfilePicture, profile_picture => profile_picture.user)
    profile_picture: ProfilePicture;

    @BeforeInsert()
    async beforeInsertion() {
        // store password as a hash
        await this.updatePassword();
    }

    @BeforeUpdate()
    async beforeUpdate() {
        // capitalize first and second name
        this.first_name.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        this.second_name.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    /**
     * Compare a password with the one encrypted in the database
     * @param passwordToCompare Password to check against
     */
    async comparePassword(passwordToCompare: string): Promise<boolean> {
        return await bcrypt.compare(passwordToCompare, this.password);
    }

    /**
     * Update password field with a hashed password
     */
    async updatePassword() {
        try {
            const hash = await bcrypt.hash(this.password, 12);
            this.password = hash;
        } catch (error) {
            throw error;
        }
    }
}
