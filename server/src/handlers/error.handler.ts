import {
    Middleware, ExpressErrorMiddlewareInterface,
    HttpError, BadRequestError, ForbiddenError,
    InternalServerError, MethodNotAllowedError, NotAcceptableError, NotFoundError, UnauthorizedError
} from 'routing-controllers';
import { ApiResponse, HTTP_STATUS_CODE } from './apiResponse.handler';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {

    error(error: any, request: any, response: any, next: any) {
        let status: HTTP_STATUS_CODE = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        if (error instanceof HttpError ||
            error instanceof BadRequestError ||
            error instanceof ForbiddenError ||
            error instanceof InternalServerError ||
            error instanceof MethodNotAllowedError ||
            error instanceof NotAcceptableError ||
            error instanceof NotFoundError ||
            error instanceof UnauthorizedError) {
            status = error.httpCode;
        }
        if (process.env.NODE_ENV === 'production') {
            return new ApiResponse(response)
                .withStatusCode(status).withData(error.message).build();
        }
        return new ApiResponse(response)
            .withStatusCode(status).withData(error.message)
            .withStackTrace(error.stack)
            .build();
    }
}
