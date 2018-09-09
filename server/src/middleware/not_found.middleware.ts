import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../handlers/api_response.handler';

@Middleware({ type: 'after' })
export class NotFoundMiddleware implements ExpressMiddlewareInterface {

    public use(req: Request, res: Response, next?: NextFunction): void {
        if (!res.headersSent) {
            // TODO: match current url against every registered one
            // because NotFoundMiddleware is reached if no value is returned in the controller.
            // so we need to set 404 only if really there are no path handling this.
            // or we just have to return with null?
            res = new ApiResponse(res).withStatusCode(404).withData(`Cannot ${req.method} to ${req.originalUrl}`).build();
        }
        res.end();
    }
}
