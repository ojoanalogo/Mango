import { User } from '../models/user.model';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

export class AuthService {
    /**
     * Creates a set of 2 JWT, one normal token and one refresh token
     * @param user user Object
     * @returns {Promise<any>} promise with the result of the operation
     */
    static async createJWT(user: User): Promise<any> {
        const token = await jwt.sign({}, process.env.JWT_SECRET, {expiresIn: '15m'});
        const refreshToken = await jwt.sign({ 'iat': moment().add(15, 'minutes').unix()}, process.env.JWT_SECRET, {expiresIn: '14d'});
        return {'jwt' : token, 'refresh' : refreshToken};
    }
}
