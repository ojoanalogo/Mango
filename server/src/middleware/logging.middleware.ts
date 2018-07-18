import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Response, Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';
import * as rfs from 'rotating-file-stream';

export class LoggingMiddleware implements ExpressMiddlewareInterface {

    dir: string = path.join(__dirname + '../../../logs/'); // logs directory, outside of server dir
    accessLogStream: any; // stream
    fileLog: any;
    consoleLog = morgan('dev'); // declare console logger
    constructor() {
        if (process.env.NODE_ENV === 'production') {
            // creates a logs directory if no available
            if (fs.existsSync(this.dir)) {
                console.log('Creating directory');
                fs.mkdirSync(this.dir);
            }
            this.accessLogStream = rfs('requests.log', {
                interval: '1d', // 1 day for every log
                path: this.dir
            });
            this.fileLog = morgan('common', {
                stream: this.accessLogStream,
            });
        }
    }

    /**
     * Logging middleware, logs requests and outputs every request to a file (production) and to console
     * @param request request Object
     * @param response response Object
     * @param next proceeed to next operation
     */
    use(request: Request, response: Response, next?: (err?: any) => any): any {
        if (process.env.NODE_ENV === 'production') {
            this.fileLog(request, response, () => {
                this.consoleLog(request, response, next);
            });
        } else {
            this.consoleLog(request, response, next);
        }
    }
}
