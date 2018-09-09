import {
    Middleware, ExpressErrorMiddlewareInterface,
    HttpError, BadRequestError, ForbiddenError,
    InternalServerError, MethodNotAllowedError, NotAcceptableError, NotFoundError, UnauthorizedError
} from 'routing-controllers';
import { HTTP_STATUS_CODE } from './api_response.handler';
import { ApiError } from './api_error.handler';
import { Logger } from '../services/logger.service';
const log = Logger.getInstance().getLogger();

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
        if (status >= 400 && status < 500) {
            log.warn(error);
        }
        if (status >= 500) {
            log.error(error.message);
        }
        if (process.env.NODE_ENV === 'production') {
            return new ApiError(response)
                .withErrorName(error.name)
                .withData(error.message)
                .withStatusCode(status).build();
        }
        return new ApiError(response)
            .withErrorName(error.name)
            .withStackTrace(error.stack)
            .withStatusCode(status).withData(error.message)
            .build();
    }
}
