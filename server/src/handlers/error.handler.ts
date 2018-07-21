import {Middleware, ExpressErrorMiddlewareInterface} from 'routing-controllers';
import { ResponseHandler, ResponseCode } from './response.handler';

@Middleware({ type: 'after' })
export class ErrorHandler extends ResponseHandler implements ExpressErrorMiddlewareInterface {

    /**
     * Custom error handler
     * @param error error Object
     * @param request request Object
     * @param response response Object
     * @param next unblock operation
     */
    error(error: any, request: any, response: any, next: (err: any) => any) {
        next(this.createResponse(response, error.message, error.httpCode, ResponseCode.ERROR));
    }
}
