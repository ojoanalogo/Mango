import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UnauthorizedError } from 'routing-controllers';
import { User } from '../users/user.entity';
import { Token } from './token.entity';
import { TokenRepository } from './token.repository';
import { UserRepository } from '../users/user.repository';
import { ServerLogger } from '../../lib/logger';
import { Logger } from '../../decorators';
import { JSONUtils } from '../../utils';
import { JWTPayload } from './jwt_payload.interface';
import { JWT_SECRET, IS_PRODUCTION, JWT_TOKEN_LIFE } from '../../../config';
import jwt = require('jsonwebtoken');
import httpContext = require('express-http-context');

@Service()
export class AuthService {

  constructor(
    @Logger(__filename) private readonly logger: ServerLogger,
    @InjectRepository(Token) private readonly tokenRepository: TokenRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,
    private readonly jsonUtils: JSONUtils) { }

  /**
   * Create a JWT token for specified user
   * @param user - User object
   * @param refresh - Should be refresh the token?
   * @returns Promise with the result of the operation
   */
  public async createJWT(user: User, refresh?: boolean): Promise<string> {
    const duration = JWT_TOKEN_LIFE;
    const payload: Partial<JWTPayload> = {
      user: {
        id: user.id,
        email: user.email
      }
    };
    // sign a new JWT token with a payload and a custom duration
    const token: string = await jwt.sign(payload, JWT_SECRET, { expiresIn: duration });
    // new token logic
    if (!refresh) {
      // create JWT entity instance to store in database
      const userAgent = httpContext.get('useragent');
      const tokenInstance = new Token();
      tokenInstance.token = token;
      tokenInstance.agent = userAgent;
      tokenInstance.user = user; // asign relationship
      this.logger.info(`Creating new token for user id: ${user.id}, agent: ${userAgent}`);
      // now we save the token in our token repository
      await this.tokenRepository.save(tokenInstance);
    };
    return token;
  }

  /**
   * Checks user credentials and validates him
   * @param user - User object
   * @returns User entity or false if password is wrong
   */
  public async loginUser(user: User): Promise<User | boolean> {
    const userDB = await this.userRepository.findOne({ email: user.email });
    // compares user password from login request with the one found associated to the email in the database (user Model)
    const rs = await userDB.comparePassword(user.password);
    if (rs) {
      await this.userRepository.update(userDB.id, { last_login: new Date() });
      // update token in repo
      const jwtToken = await this.createJWT(userDB);
      // return user data with token
      userDB.token = <any>jwtToken;
      // return user model object
      return this.jsonUtils.filterDataFromObject(userDB, this.jsonUtils.commonUserProperties);
    } else {
      // wrong password mate
      return false;
    }
  }

  /**
   * Deletes all the tokens for user in database
   * @param user - User object
   */
  public async deleteTokens(user: User): Promise<any> {
    try {
      await this.tokenRepository.delete({ user: user });
      this.logger.info('Deleted tokens for user id: ' + user.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an old JWT token with a new one
   * @param token - Old JWT token
   * @returns The new token
   */
  public async refreshToken(token: string): Promise<any> {
    const tokenDB = await this.tokenRepository.getTokenWithUser(token);
    if (!tokenDB) {
      throw new UnauthorizedError('Token no longer valid (already refreshed)');
    }
    const newToken = await this.createJWT(tokenDB.user, true);
    this.logger.info(`Refreshing user token for user id: ${tokenDB.user.id}, agent: ${tokenDB.agent}`);
    await this.tokenRepository.update({ token: token }, { token: newToken, last_time_refreshed: new Date() });
    return newToken;
  }

  /**
   * Verifies and decode a JWT token
   * @param token - JWT token encoded
   * @returns Token verification
   */
  public async verifyToken(token: string): Promise<object | string> {
    return await jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Decode JWT token without verifyng signature
   * @param token - JWT token
   * @returns Decoded token
   */
  public async decodeToken(token: string): Promise<any> {
    return await jwt.decode(token);
  }
}
