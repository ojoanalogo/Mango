import { Service } from 'typedi';
import {
    ExpressMiddlewareInterface, UnauthorizedError,
    NotAcceptableError, ForbiddenError, Middleware
} from 'routing-controllers';
import { Response, Request } from 'express';
import { JWTService } from '../services/jwt.service';
import { Logger, LoggerService } from '../services/logger.service';
import { User } from '../entities/user/user.model';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';

@Service()
@Middleware({ type: 'before' })
export class JWTMiddleware implements ExpressMiddlewareInterface {

    constructor(@Logger() private logger: LoggerService, private jwtService: JWTService) { }

    /**
     * JWT Middleware, here we check if request has a valid JWT token and we renew it if is still valid
     *
     * @param request - Request object
     * @param response - Response object
     * @param next - Next function
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
        request['token'] = token;
        // test Regex for valid JWT token
        if (/[A-Za-z0-9\-\._~\+\/]+=*/.test(token) && /[Bb]earer/.test(schema)) {
            try {
                const jwtTokenDecoded = await this.jwtService.verifyToken(token);
                // now we check if the decoded token belongs to the user
                const user = jwtTokenDecoded['user'];
                if (!user) {
                    throw new NotAcceptableError('Invalid Token data');
                }
                // bind token to request object
                request['user'] = user;
                // allow request
                next();
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    const decoded = await this.jwtService.decodeToken(token);
                    const exp = moment(decoded.exp * 1000);
                    const dif = exp.diff(new Date(), 'days');
                    if (dif >= -7) {
                        const user: User = decoded['user'];
                        if (!user) {
                            throw new NotAcceptableError('Invalid Token data');
                        }
                        this.logger.getLogger().info('Refreshing token for user ID (' + user.id + ')');
                        const newToken = await this.jwtService.refreshToken(token);
                        // send the new shiny token
                        response.setHeader('X-Auth-Token', newToken);
                        // bind token and user id to request object
                        request['token'] = newToken;
                        request['user'] = user;
                        next();
                        return;
                    } else {
                        throw new ForbiddenError('Token expired');
                    }
                } else if (error instanceof jwt.JsonWebTokenError) {
                    throw new NotAcceptableError('Invalid Token');
                }
                throw error;
            }
        } else {
            // bad code format, should not happen
            throw new NotAcceptableError('Invalid Token');
        }
    }
}

