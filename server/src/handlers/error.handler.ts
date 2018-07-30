import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { ResponseHandler, ResponseCode, HTTP_STATUS_CODE } from './response.handler';

@Middleware({ type: 'after' })
export class ErrorHandler extends ResponseHandler implements ExpressErrorMiddlewareInterface {

    error(error: any, request: any, response: any, next: (err: any) => any) {
        if (process.env.NODE_ENV === 'production') {
            next(this.createResponse(response, error.name, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR));
        }
        next(this.createResponse(response, error, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR));
    }
}
