import {
    ExpressMiddlewareInterface, UnauthorizedError,
    NotAcceptableError, ForbiddenError, InternalServerError
} from 'routing-controllers';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { Service } from 'typedi';
import * as jwt from 'jsonwebtoken';

@Service()
export class JWTMiddleware implements ExpressMiddlewareInterface {

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
        if (/[A-Za-z0-9\-\._~\+\/]+=*/.test(token)) {
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
                // const tokenDB = await this.authService.getToken(user.id);
                // if (tokenDB !== token) {
                //     // forbid request
                //     throw new UnauthorizedError('Token doesn\'t belongs to user');
                // } else {
                //     // bind token to request object
                //     request['token'] = token;
                //     // allow request
                //     next();
                // }
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    throw new ForbiddenError('Token expired');
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

