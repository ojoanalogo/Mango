import { ExpressMiddlewareInterface } from 'routing-controllers';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';
import * as rfs from 'rotating-file-stream';

export class LoggingMiddleware implements ExpressMiddlewareInterface {

    dir: string = path.join(__dirname + '../../../logs/');
    accessLogStream: any;
    fileLog: any;
    consoleLog = morgan('dev');
    constructor() {
        if (process.env.NODE_ENV === 'production') {
            if (fs.existsSync(this.dir)) {
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

    use(request: express.Request, response: express.Response, next?: (err?: any) => any): any {
        if (process.env.NODE_ENV === 'production') {
            this.fileLog(request, response, () => {
                this.consoleLog(request, response, next);
            });
        } else {
            this.consoleLog(request, response, next);
        }
    }
}
