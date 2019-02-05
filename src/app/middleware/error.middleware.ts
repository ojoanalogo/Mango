import { Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface} from 'routing-controllers';
import { HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { ApiError } from '../handlers/api_error.handler';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';
import { ServerLogger } from '../lib/logger';
import * as fs from 'fs-extra';

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
  async error(error: any, request: Request, response: Response, next: any) {
    const status: HTTP_STATUS_CODE = error.httpCode || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    const log = new ServerLogger(__filename);
    const apiError = new ApiError(response);
    apiError.withData(error.message);
    apiError.withErrorName(error.name);
    if (error instanceof EntityMetadataNotFoundError) {
      // this should happen when database is not connected
      apiError.withData('Database is down');
    }
    if (request.files) {
      // remove files if exists because we don't need it
      log.info('Removing uploaded files (' + request.files.length + ') because operation failed');
      for (const i of Object.keys(request.files)) {
        try {
          const fileExists = await fs.pathExists(request.files[i].path);
          if (fileExists) {
            await fs.unlink(request.files[i].path);
            log.info(`Done removing file (${parseInt(i) + 1})`);
          }
        } catch (error) {
          log.error(`Something went wrong deleting uploaded files (${i + 1})`);
          log.error(error.stack);
        }
      }
    }
    // begin building apiError object with status code
    apiError.withStatusCode(status);
    if (status >= 500) {
      log.error(error.stack);
      if (process.env.NODE_ENV !== 'production') {
        apiError.withStackTrace(error.stack);
      }
    }
    return apiError.build();
  }
}
