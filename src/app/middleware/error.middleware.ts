import { Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';
import { IS_DEVELOPMENT, IS_TEST } from '../../config';
import { ApiError } from '../handlers/api_error.handler';
import { HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { ServerLogger } from '../lib/logger';
import fs = require('fs-extra');

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {


  private log = new ServerLogger(__filename);

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
    const apiError = new ApiError(response);
    apiError.withData(error.message);
    apiError.withErrorName(error.name);
    if (error instanceof EntityMetadataNotFoundError) {
      // this should happen when database is not connected
      apiError.withData('Database is down');
    }
    // remove uploaded files if exists because we don't need them
    if (request.files || request.file) {
      await this.handleUploadedFiles(request);
    }
    // begin building apiError object with status code
    apiError.withStatusCode(status);
    if (status >= 500) {
      this.log.error(error.stack);
      if (IS_DEVELOPMENT || IS_TEST) {
        apiError.withStackTrace(error.stack);
      }
    }
    return apiError.build();
  }

  /**
   * Handle uploaded files and delete them from disk if operation failed
   * @param request - Request object
   */
  async handleUploadedFiles(request: Request) {
    // multiple files
    if (request.files) {
      this.log.info('Removing uploaded files (' + request.files.length + ') because operation failed');
      for (const i of Object.keys(request.files)) {
        try {
          const fileExists = await fs.pathExists(request.files[i].path);
          if (fileExists) {
            await fs.unlink(request.files[i].path);
            this.log.info(`Done removing file (${parseInt(i) + 1})`);
          }
        } catch (error) {
          this.log.error(`Something went wrong deleting uploaded file (${i + 1} | ${request.files[i].filename})`);
          this.log.error(error.stack);
        }
      }
    }
    // single file
    if (request.file) {
      this.log.info('Removing uploaded file (' + request.file.path + ') because operation failed');
      try {
        const fileExists = await fs.pathExists(request.file.path);
        if (fileExists) {
          await fs.unlink(request.file.path);
          this.log.info(`Done removing file (${request.file.filename}})`);
        }
      } catch (error) {
        this.log.error(`Something went wrong deleting uploaded file (${request.file.filename})`);
        this.log.error(error.stack);
      }
    }

  }
}
