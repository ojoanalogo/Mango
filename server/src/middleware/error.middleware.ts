import {
    Middleware, ExpressErrorMiddlewareInterface,
    HttpError, BadRequestError, ForbiddenError,
    InternalServerError, MethodNotAllowedError, NotAcceptableError, NotFoundError, UnauthorizedError
} from 'routing-controllers';
import { Container } from 'typedi';
import { HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { ApiError } from '../handlers/api_error.handler';
import { Logger } from '../services/logger.service';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {

    /**
     * Custom error interceptor
     *
     * @param error - Error object
     * @param request - Request object
     * @param response - Response object
     * @param next - Next function
     */
    error(error: any, request: any, response: any, next: any) {
        let status: HTTP_STATUS_CODE = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        const log = Container.get(Logger);
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
            log.getLogger().warn(error);
        }
        if (status >= 500) {
            log.getLogger().error(error.message);
            if (process.env.NODE_ENV !== 'production') {
                apiError.withStackTrace(error.stack);
            }
        }
        return apiError.build();
    }
}
