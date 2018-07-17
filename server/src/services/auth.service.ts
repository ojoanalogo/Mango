import { User } from '../models/user.model';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

export class AuthService {
    static async createJWT(user: User) {
        const token = await jwt.sign({}, process.env.JWT_SECRET, {expiresIn: '15m'});
        const refreshToken = await jwt.sign({ 'iat': moment().add(15, 'minutes').unix()}, process.env.JWT_SECRET, {expiresIn: '14d'});
        return {'jwt' : token, 'refresh' : refreshToken};
    }
}
