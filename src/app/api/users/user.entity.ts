import { BeforeInsert, Column, Entity, OneToMany, OneToOne, UpdateDateColumn, Any } from 'typeorm';
import { PASSWORD_SALT_ROUNDS } from '../../../config';
import { Token } from '../auth/token.entity';
import { CUID } from '../common/CUID';
import { ProfilePicture } from './user_profile_picture.entity';
import { Role, RoleType } from './user_role.entity';
import bcrypt = require('bcrypt');

@Entity('users')
export class User extends CUID {

  @Column()
  public first_name: string;

  @Column()
  public second_name: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @Column({ default: true })
  public is_active: boolean;

  @UpdateDateColumn()
  public last_login: Date;

  // accept both Token object or string (for API response object)
  @OneToMany(() => Token, token => token.user, { eager: true })
  public token: Token | string;

  public userRole: RoleType | string;

  @OneToOne(() => Role, role => role.user, { eager: true })
  public role: Role;

  @OneToOne(() => ProfilePicture, profile_picture => profile_picture.user, { eager: true })
  public profile_picture: ProfilePicture;

  /**
   * Before insertion
   */
  @BeforeInsert()
  async beforeInsertion(): Promise<void> {
    // store password as a hash
    await this.updatePassword();
  }

  /**
   * Compare a password with the one encrypted in the database
   * @param passwordToCompare - Password to check against
   * @returns Returns is password is valid
   */
  public async comparePassword(passwordToCompare: string): Promise<boolean> {
    try {
      return await bcrypt.compare(passwordToCompare, this.password);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update password field with a hashed password
   */
  public async updatePassword(): Promise<void> {
    try {
      const hash = await bcrypt.hash(this.password, PASSWORD_SALT_ROUNDS);
      this.password = hash;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user name
   */
  public getName(): string {
    if (this.first_name && this.second_name) {
      return `${this.first_name} ${this.second_name}`;
    }
    return 'no name';
  }
}
