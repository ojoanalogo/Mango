import { Service } from 'typedi';
import { User } from '../entities/user/user.model';
import { TokenRepository } from '../repositories/token.repository';
import { NotFoundError } from 'routing-controllers';
import * as jwt from 'jsonwebtoken';

@Service()
export class AuthService {

    constructor(private tokenRepository: TokenRepository) { }

    /**
     * Creates a set of 2 JWT, one normal token and one refresh token
     * @param user user Object
     * @returns {Promise<any>} promise with the result of the operation
     */
    public async createJWT(user: User): Promise<any> {
        try {
            const token = await jwt.sign({
                user: {
                    id: user.id
                },
            }, process.env.JWT_SECRET, { expiresIn: '15m' });
            return token;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verifies and decode a JWT token
     * @param token JWT token encoded
     */
    public async verifyToken(token: string): Promise<object | string> {
        return await jwt.verify(token, process.env.JWT_SECRET);
    }

    /**
     * Return token associated to user ID
     * @param id user ID
     */
    public async getToken(id: number): Promise<string> {
        try {
            const token = await this.tokenRepository.getToken(id);
            if (!token) {
                throw new NotFoundError('Provided token invalid (user removed?)');
            }
            return token['token'];
        } catch (error) {
            throw error;
        }
    }
}
