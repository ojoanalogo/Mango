import {
    Middleware, ExpressErrorMiddlewareInterface,
    HttpError, BadRequestError, ForbiddenError,
    InternalServerError, MethodNotAllowedError, NotAcceptableError, NotFoundError, UnauthorizedError
} from 'routing-controllers';
import { HTTP_STATUS_CODE } from './api_response.handler';
import { ApiError } from './api_error.handler';
import { Logger } from '../utils/logger.util';
const log = Logger.getInstance().getLogger();

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {

    error(error: any, request: any, response: any, next: any) {
        let status: HTTP_STATUS_CODE = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        const apiError = new ApiError(response);
        apiError.withData(error.message);
        apiError.withErrorName(error.name);
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
        apiError.withStatusCode(status);
        if (status >= 400 && status < 500) {
            log.warn(error);
        }
        if (status >= 500) {
            log.error(error.message);
            if (process.env.NODE_ENV !== 'production') {
                apiError.withStackTrace(error.stack);
            }
        }
        return apiError.build();
    }
}
