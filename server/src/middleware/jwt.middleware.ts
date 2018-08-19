import { ExpressMiddlewareInterface, UnauthorizedError, ForbiddenError, NotAcceptableError } from 'routing-controllers';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';

export class JWTMiddleware implements ExpressMiddlewareInterface {

    private response: Response;
    /**
     * JWT Middleware
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    async use(request: Request, response: Response, next?: (err?: any) => any): Promise<any> {
        this.response = response;
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
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded) {
                    // allow request
                    next();
                } else {
                   throw new ForbiddenError('Token Expired');
                }
            } catch (error) {
                // bad code
                throw new UnauthorizedError('Invalid signature');
            }
        } else {
            // bad code format
            throw new NotAcceptableError('Invalid Token');
        }
    }
}
