import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Response, Request } from 'express';
import { morganOption } from '../components/logger/logger.service';
import * as morgan from 'morgan';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {

    /**
     * Logging middleware, logs requests and outputs every request to a file (production) and to console
     *
     * @param request - Request object
     * @param response - Response object
     * @param next - Next function
     */
    use(request: Request, response: Response, next?: (err?: any) => any): any {
        const morganLevel = process.env.NODE_ENV !== 'production' ? 'dev' : 'common';
        morgan(morganLevel, morganOption)(request, response, next);
    }
}

