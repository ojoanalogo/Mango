import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { ResponseHandler, ResponseCode } from '../handlers/response.handler';

export class ClientMiddleware extends ResponseHandler implements ExpressMiddlewareInterface {

    /**
     * Client Middleware
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    use(request: Request, response: Response, next?: (err?: any) => any): any {
        // get auth header from request
        const requestHeader = request.get('X-Requested-With');
        console.log('header: ' + requestHeader);
        next();
    }

    /**
     * Returns a response object with a common message
     * @param response response Object
     * @returns {response} response Object with authorization code invalid payload
     */
    private invalidCode(response: Response): Response {
        return this.createResponse(response, 'Not valid operation, please use another client :)', 403, ResponseCode.NOT_AUTHORIZED);

    }
}
