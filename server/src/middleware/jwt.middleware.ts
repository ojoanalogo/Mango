import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { ResponseHandler } from '../util/response.handler';
import * as jwt from 'jsonwebtoken';

export class JWTMiddleware extends ResponseHandler implements ExpressMiddlewareInterface {

    use(request: Request, response: Response, next?: (err?: any) => any): any {
        console.log(process.env.JWT_SECRET);
        const tok = jwt.sign({'hola': 'mundo'}, process.env.JWT_SECRET, {expiresIn: 60 * 60});
        console.log(tok);
        const token = request.get('authorization');
        if (token == null) {
            return this.createResponse(response, 'Authorization required', 401, 0);
            next(false);
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded) {
                next();
            }
        } catch (error) {
            this.createResponse(response, 'Authorization code invalid', 403, 0);
        }
    }
}
