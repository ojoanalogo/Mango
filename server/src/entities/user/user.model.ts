import { Entity, Column, BeforeInsert, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { JwtToken } from '../token/token.model';
import { ProfilePicture } from './user_profile_picture.model';
import { Role } from './user_role.model';
import { CUID } from '../CUID';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User extends CUID {

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

    @OneToMany(() => JwtToken, token => token.user)
    token: JwtToken;

    @OneToOne(() => Role, role => role.user)
    role: Role;

    @OneToOne(() => ProfilePicture, profile_picture => profile_picture.user)
    profile_picture: ProfilePicture;

    /**
     * Before insertion
     */
    @BeforeInsert()
    async beforeInsertion() {
        // store password as a hash
        await this.updatePassword();
    }

    /**
     * Compare a password with the one encrypted in the database
     * @param passwordToCompare - Password to check against
     * @returns Returns is password is valid
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
