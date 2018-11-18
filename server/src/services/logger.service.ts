import { Format } from 'logform';
import { Options } from 'morgan';
import { Service, Container } from 'typedi';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as httpContext from 'express-http-context';


export function Logger() {
    return function(object: Object, propertyName: string, index?: number) {
        const logger = new LoggerService();
        Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
    };
}

@Service()
export class LoggerService {

    private logger: winston.Logger;
    private loggerHTTP: winston.Logger;
    /**
    * Common logger format, we strip colors and add a Timestamp
    * @returns LogFormat
    */
    private logFormat: Format = winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        winston.format.json(),
    );

    constructor() {
        this.setupLogger();
        this.setupConsoleStream();
    }

    /**
     * Get main logger object
     * @returns winston logger object
     */
    public getLogger(): winston.Logger {
        return this.logger;
    }

    /**
     * Get http logger
     * @returns winston HTTP logger object
     */
    public getHTTPLogger(): winston.Logger {
        return this.loggerHTTP;
    }

    /**
     * Setup main logger
     */
    private setupLogger() {
        process.env.NODE_ENV === 'production' ?
            this.logger = winston.createLogger({
                level: 'info',
                transports: [
                    new DailyRotateFile({
                        level: 'error',
                        filename: path.join(__dirname, `../../logs/error-%DATE%.log`),
                        format: this.logFormat,

                        datePattern: 'YYYY-MM-DD-HH',
                        zippedArchive: true,
                        maxSize: '20m',
                        maxFiles: '31d'
                    }),
                    new DailyRotateFile({
                        filename: path.join(__dirname, `../../logs/combined-%DATE%.log`),
                        format: this.logFormat,
                        datePattern: 'YYYY-MM-DD-HH',
                        zippedArchive: true,
                        maxSize: '20m',
                        maxFiles: '31d'
                    })
                ]
            }) : this.logger = winston.createLogger({ level: 'info' });
        process.env.NODE_ENV === 'production' ?
            this.loggerHTTP = winston.createLogger({
                level: 'http',
                levels: {
                    http: 1
                },
                transports: [
                    new DailyRotateFile({
                        format: winston.format.combine(
                            winston.format.uncolorize(),
                            winston.format.printf((info) => {
                                const reqId = httpContext.get('reqId');
                                const message = reqId ? '(' + reqId + ')' + info.message : info.message;
                                return message;
                            })
                        ),
                        filename: path.join(__dirname, `../../logs/http-%DATE%.log`),
                        datePattern: 'YYYY-MM-DD-HH',
                        zippedArchive: true,
                        maxSize: '20m',
                        maxFiles: '31d'
                    })
                ]
            }) : this.loggerHTTP = winston.createLogger({ level: 'http' });
    }

    /**
     * Setup console stream
     */
    private setupConsoleStream() {
        /**
        * formatted thanks to https://github.com/winstonjs/winston/issues/1135#issuecomment-343980350
        */
        if (process.env.NODE_ENV !== 'production') {
            const settings = {
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp(),
                    winston.format.align(),
                    winston.format.printf((info) => {
                        const {
                            timestamp, level, message, ...args
                        } = info;
                        const reqId = httpContext.get('reqId');
                        const msgNew = reqId ? '\tRequestID: (' + reqId + ') ' + info.message.replace('\t', '') : info.message;
                        const ts = timestamp.slice(0, 19).replace('T', ' ');
                        return `${ts} ${level}: ${msgNew} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                    })
                )
            };
            this.logger.add(new winston.transports.Console(settings));
            this.loggerHTTP.add(new winston.transports.Console(settings));
        }
    }
}

/**
 * Overwrite stream function to throw messages to our http logger
 * @returns Morgan options
 */
export const morganOption: Options = {
    stream: {
        write: function (message: string) {
            const logger = Container.get(LoggerService);
            logger.getHTTPLogger().log('http', message.replace('\n', ''));
        }
    }
};
