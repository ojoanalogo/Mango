import { ProfilePicture } from './user_profile_picture.entity';
import { RoleType } from './user_role.entity';

/**
 * User profile interface
 */
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  second_name: string;
  role: RoleType;
  profile_picture: Partial<ProfilePicture>;
  token: string;
}
