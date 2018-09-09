import { Service } from 'typedi';
import { User } from '../entities/user/user.model';
import { TokenRepository } from '../repositories/token.repository';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

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
            }, process.env.JWT_SECRET, { expiresIn: '3d' });
            const refreshToken = await jwt.sign(
                { iat: moment().add(15, 'minutes').unix() }
                , process.env.JWT_SECRET, { expiresIn: '7d' });
            return { 'jwt': token, 'refresh': refreshToken };
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
            const token = await this.tokenRepository.createQueryBuilder('token')
                .innerJoin('token.user', 'user')
                .where('user.id = :id', { id: id })
                .select('token.token')
                .getOne();
                if (!token) {
                    throw new UnauthorizedError('Token not found');
                }
            return token['token'];
        } catch (error) {
            throw error;
        }
    }
}
