import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { ResponseHandler } from '../handlers/response.handler';
import * as jwt from 'jsonwebtoken';

export class JWTMiddleware extends ResponseHandler implements ExpressMiddlewareInterface {

    use(request: Request, response: Response, next?: (err?: any) => any): any {
        const authorizationHeader = request.get('authorization');
        if (authorizationHeader == null) {
            return this.createResponse(response, 'Authorization required', 401, 0);
        }
        if (process.env.NODE_ENV !== 'production') {
            console.log('>' + authorizationHeader);
        }
        const tokenParts = authorizationHeader.split(' ');
        if (tokenParts.length < 1) {
            this.invalidCode(response);
        }
        const schema = tokenParts[0]; // should be "Bearer"
        const token = tokenParts[1];
        // test for valid JWT token
        if (/[A-Za-z0-9\-\._~\+\/]+=*/.test(token)) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded) {
                    // allow request
                    next();
                }
            } catch (error) {
                this.invalidCode(response);
            }
        } else {
            this.invalidCode(response);
        }
    }

    private invalidCode(response: Response): Response {
        return this.createResponse(response, 'Authorization code invalid', 403, 0);

    }
}
