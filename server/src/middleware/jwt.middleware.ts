import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { ResponseHandler, HTTP_STATUS_CODE, ResponseCode } from '../handlers/response.handler';
import * as jwt from 'jsonwebtoken';

export class JWTMiddleware extends ResponseHandler implements ExpressMiddlewareInterface {

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
            return this.createResponse(response, 'Authorization required', HTTP_STATUS_CODE.UNAUTHORIZED, ResponseCode.NOT_AUTHORIZED);
        }
        // an AUTH header looks like 'SCHEMA XXXXXXXXXXXX, so we should split it'
        const tokenParts = authorizationHeader.split(' ');
        // validate length of the array with token
        if (tokenParts.length < 1) {
            this.invalidCode('Invalid token structure');
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
                    this.createResponse(response, 'token is dead', HTTP_STATUS_CODE.FORBIDDEN, ResponseCode.EXPIRED);
                }
            } catch (error) {
                // bad code
                this.invalidCode('Invalid signature');
            }
        } else {
            // bad code format
            this.invalidCode('Invalid token');
        }
    }

    /**
     * Returns a response object with a common message
     * @returns {response} response Object with authorization code invalid payload
     */
    private invalidCode(msg: string): Response {
        return this.createResponse(this.response, msg, HTTP_STATUS_CODE.UNAUTHORIZED, ResponseCode.NOT_AUTHORIZED);

    }
}
