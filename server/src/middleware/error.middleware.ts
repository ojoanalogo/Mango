import {
    Middleware, ExpressErrorMiddlewareInterface,
    HttpError, BadRequestError, ForbiddenError,
    InternalServerError, MethodNotAllowedError, NotAcceptableError, NotFoundError, UnauthorizedError
} from 'routing-controllers';
import { Container } from 'typedi';
import { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { ApiError } from '../handlers/api_error.handler';
import { LoggerService } from '../services/logger.service';
import { unlink } from 'fs';

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
    error(error: any, request: Request, response: Response, next: any) {
        let status: HTTP_STATUS_CODE = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        const log = Container.get(LoggerService);
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
        if (request.files) {
            // remove files if exists because we don't need it
            log.info('Removing uploaded files (' + request.files.length + ') because operation failed');
            for (let index = 0; index < request.files.length; index++) {
                unlink(request.files[index].path, (err) => {
                    !err ? log.info('Done removing file (' + index + ')') :
                        log.info('Something went wrong deleting file (' + index + ')');
                });
            }
        }
        // begin building apiError object with status code
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
