import { Service } from 'typedi';
import { UnauthorizedError } from 'routing-controllers';
import { User } from '../entities/user/user.model';
import { Token } from '../entities/token/token.model';
import { TokenRepository } from '../repositories/token.repository';
import { LoggerService, Logger } from './logger.service';
import * as jwt from 'jsonwebtoken';
import * as httpContext from 'express-http-context';

@Service()
export class JWTService {

    constructor(
        @Logger() private logger: LoggerService,
        private tokenRepository: TokenRepository) { }

    /**
     * Create a JWT token for specified user
     * @param user - User object
     * @param refresh - Should be refresh the token?
     * @returns Promise with the result of the operation
     */
    public async createJWT(user: User, refresh?: boolean): Promise<any> {
        try {
            const duration = process.env.NODE_ENV === 'production' ? '30m' : '3d';
            const token = await jwt.sign({
                user: {
                    id: user.id
                },
            }, process.env.JWT_SECRET, { expiresIn: duration });
            if (!refresh) {
                // create JWT entity instance to store in database
                const userAgent = httpContext.get('useragent');
                const tokenInstance = new Token();
                tokenInstance.token = token;
                tokenInstance.agent = userAgent;
                tokenInstance.user = user; // asign relationship
                this.logger.getLogger().info(`Creating new token for user id: ${user.id}, agent: ${userAgent}`);
                // now we save the token in our token repository
                await this.tokenRepository.save(tokenInstance);
            }
            return token;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Updates an old JWT token with a new one
     * @param token - Old JWT token
     * @returns The new token
     */
    public async refreshToken(token: string): Promise<any> {
        try {
            const tokenDB = await this.tokenRepository.getTokenWithUser(token);
            if (!tokenDB) {
                throw new UnauthorizedError('Token no longer valid (already refreshed)');
            }
            const newToken = await this.createJWT(tokenDB.user, true);
            this.logger.getLogger().info(`Refreshing user token for user id: ${tokenDB.user.id}, agent: ${tokenDB.agent}`);
            await this.tokenRepository.update({ token: token }, { token: newToken, last_time_refreshed: new Date() });
            return newToken;
        } catch (error) {
            throw error;
        }
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
