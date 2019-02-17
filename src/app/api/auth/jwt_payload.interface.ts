import { User } from '../users/user.entity';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  user: Partial<User>;
  iat: Date;
  eat: Date;
}
