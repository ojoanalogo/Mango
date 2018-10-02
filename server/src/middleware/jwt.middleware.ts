import {
    ExpressMiddlewareInterface, UnauthorizedError,
    NotAcceptableError, InternalServerError, ForbiddenError
} from 'routing-controllers';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { Service } from 'typedi';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';

@Service()
export class JWTMiddleware implements ExpressMiddlewareInterface {

    token: string;
    constructor(private authService: AuthService) { }

    /**
     * JWT Middleware
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    async use(request: Request, response: Response, next?: (err?: any) => any): Promise<any> {
        // get auth header from request
        const authorizationHeader = request.get('authorization');
        if (authorizationHeader == null) {
            throw new UnauthorizedError('Authorization required');
        }
        // an AUTH header looks like 'SCHEMA XXXXXXXXXXXX, so we should split it'
        const tokenParts = authorizationHeader.split(' ');
        // validate length of the array with token
        if (tokenParts.length < 1) {
            throw new NotAcceptableError('Invalid Token structure');
        }
        const schema = tokenParts[0]; // should be "Bearer"
        const token = tokenParts[1];
        // test Regex for valid JWT token
        if (/[A-Za-z0-9\-\._~\+\/]+=*/.test(token) && /[Bb]earer/.test(schema)) {
            this.token = token;
            try {
                const jwtTokenDecoded = await this.authService.verifyToken(token);
                // now we check if the decoded token belongs to the user
                const user = jwtTokenDecoded['user'];
                if (!user) {
                    throw new NotAcceptableError('Invalid Token data');
                }
                // bind token to request object
                request['token'] = token;
                // allow request
                next();
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    const decoded = await this.authService.decodeToken(this.token);
                    const exp = moment(decoded.exp * 1000);
                    const dif = exp.diff(new Date(), 'days');
                    if (dif >= -7) {
                        console.log('Refreshing token');
                        const newToken = await this.authService.refreshToken(token);
                        // send the new shiny token
                        response.setHeader('X-Auth-Token', newToken);
                        // bind token to request object
                        request['token'] = newToken;
                        next();
                        return;
                    } else {
                        throw new ForbiddenError('Token expired');
                    }
                } else if (error instanceof jwt.JsonWebTokenError) {
                    throw new InternalServerError('JWT error');
                }
                throw error;
            }
        } else {
            // bad code format, should not happen
            throw new NotAcceptableError('Invalid Token');
        }
    }
}

