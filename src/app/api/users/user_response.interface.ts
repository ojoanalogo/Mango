import { ProfilePicture } from './user_profile_picture.entity';

/**
 * User response interface
 */
export interface UserResponse {
  id: number;
  email?: string;
  first_name?: string;
  second_name?: string;
  role?: string;
  token?: string;
  profile_picture?: ProfilePicture;
}
