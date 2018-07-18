import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { ResponseHandler } from '../handlers/response.handler';
import * as jwt from 'jsonwebtoken';

export class JWTMiddleware extends ResponseHandler implements ExpressMiddlewareInterface {

    /**
     * JWT Middleware
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    use(request: Request, response: Response, next?: (err?: any) => any): any {
        // get auth header from request
        const authorizationHeader = request.get('authorization');
        if (authorizationHeader == null) {
            return this.createResponse(response, 'Authorization required', 401, 0);
        }
        // an AUTH header looks like 'SCHEMA XXXXXXXXXXXX, so we should split it'
        const tokenParts = authorizationHeader.split(' ');
        // validate length of the array with token
        if (tokenParts.length < 1) {
            this.invalidCode(response);
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
                }
            } catch (error) {
                // bad code
                this.invalidCode(response);
            }
        } else {
            // bad code format
            this.invalidCode(response);
        }
    }

    /**
     * Returns a response object with a common message
     * @param response response Object
     * @returns {response} response Object with authorization code invalid payload
     */
    private invalidCode(response: Response): Response {
        return this.createResponse(response, 'Authorization code invalid', 403, 0);

    }
}
