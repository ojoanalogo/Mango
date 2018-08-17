import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import { morganOption, morganErrorOptions } from '../services/logger.service';
import * as morgan from 'morgan';
export class LoggingMiddleware implements ExpressMiddlewareInterface {
    /**
     * Logging middleware, logs requests and outputs every request to a file (production) and to console
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    use(request: Request, response: Response, next?: (err?: any) => any): any {
        if (process.env.NODE_ENV !== 'production') {
            response.statusCode > 400 ? morgan('dev', morganErrorOptions)(request, response, next) :
                morgan('dev', morganOption)(request, response, next);
        } else {
            response.statusCode > 400 ? morgan('common', morganErrorOptions)(request, response, next) :
                morgan('common', morganOption)(request, response, next);

        }
    }
}
