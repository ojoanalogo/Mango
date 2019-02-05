import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Response, Request } from 'express';
import { ServerLogger } from '../lib/logger';
import { IS_PRODUCTION } from '../../config';
import * as morgan from 'morgan';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {

  /**
   * Overwrite stream function to throw messages to our http logger
   * @returns Morgan options
   */
  private morganOptions: morgan.Options = {
    stream: {
      write: (message: string) => {
        const logger = new ServerLogger(__filename);
        logger.http().log('http', message.replace('\n', ''));
      }
    }
  };

  /**
   * Logging middleware, logs requests and outputs every request to a file (production) and to console
   *
   * @param request - Request object
   * @param response - Response object
   * @param next - Next function
   */
  use(request: Request, response: Response, next?: (err?: any) => any): any {
    const morganLevel = IS_PRODUCTION ? 'common' : 'dev';
    morgan(morganLevel, this.morganOptions)(request, response, next);
  }
}

