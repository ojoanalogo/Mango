import { Format } from 'logform';
import { Options } from 'morgan';
import { Service, Container } from 'typedi';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as httpContext from 'express-http-context';

/**
 * @Logger decorator
 * @param fileName - Filename context
 */
export function Logger(fileName: string) {
    return function (object: Object, propertyName: string, index?: number) {
        const logger = new LoggerService(fileName);
        Container.registerHandler({ object, propertyName, index, value: () => logger });
    };
}

@Service()
export class LoggerService {
    private logger: winston.Logger;
    private loggerHTTP: winston.Logger;

    constructor(private fileName: string) {
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
    * Common logger format, we strip colors and add a Timestamp
    * @returns LogFormat
    */
    private getFileLogFormat(): Format {
        const addRequestUUID = winston.format(info => {
            const reqID = this.getRequestUUID();
            if (reqID) {
                info.requestID = reqID;
            }
            return info;
        });
        return winston.format.combine(
            winston.format.uncolorize(),
            winston.format.timestamp(),
            addRequestUUID(),
            winston.format.json()
        );
    }

    /**
    * Console logger format
    * @returns LogFormat
    */
    private getConsoleLogFormat(): Format {
        /**
        * formatted thanks to https://github.com/winstonjs/winston/issues/1135#issuecomment-343980350
        */
        return winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf((info) => {
                const {
                    timestamp, level, message, ...args
                } = info;
                const ts = timestamp.slice(0, 19).replace('T', ' ');
                // tslint:disable-next-line:max-line-length
                const format = `${ts} | ${level} | ${this.getOrigin()} | ${this.getRequestUUID() ? `${this.getRequestUUID()} ` : ''}» ${message.replace('\t', '')} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                return format;
            })
        );
    }

    /**
     * Setup main logger
     */
    private setupLogger() {
        if (process.env.NODE_ENV === 'production') {
            // setup transports
            const transportError = new DailyRotateFile({
                level: 'error',
                filename: path.join(__dirname, `../../logs/error-%DATE%.log`),
                format: this.getFileLogFormat(),
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '31d'
            });
            const transportCombined = new DailyRotateFile({
                level: 'info',
                filename: path.join(__dirname, `../../logs/combined-%DATE%.log`),
                format: this.getFileLogFormat(),
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '31d'
            });
            const transportHTTP = new DailyRotateFile({
                format: winston.format.combine(
                    winston.format.uncolorize(),
                    winston.format.printf((info) => {
                        const message = info.message;
                        return message;
                    })
                ),
                filename: path.join(__dirname, `../../logs/http-%DATE%.log`),
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '31d'
            });
            this.logger = winston.createLogger({
                level: 'info',
                transports: [transportError, transportCombined]
            });
            this.loggerHTTP = winston.createLogger({
                level: 'http',
                levels: {
                    http: 1
                },
                transports: [transportHTTP]
            });
        } else {
            this.logger = winston.createLogger({ level: 'info' });
            this.loggerHTTP = winston.createLogger({ level: 'http' });
        }
    }

    /**
     * This function is used to get origin from logger object (@Logger(__origin))
     * @returns Returns log origin from file
     */
    private getOrigin(): string {
        let origin = this.fileName || 'dev';
        if (this.fileName) {
            origin = origin.replace(process.cwd(), '');
            origin = origin.replace(`${path.sep}src${path.sep}`, '');
            origin = origin.replace(`${path.sep}dist${path.sep}`, '');
            origin = origin.replace(/([.]ts)|([.]js)/, '');
        }
        return origin;
    }

    /**
     * Get request context (UUID)
     * @returns request context
     */
    private getRequestUUID(): string {
        const reqId = httpContext.get('reqId');
        return reqId;
    }

    /**
     * Setup console stream
     */
    private setupConsoleStream() {
        this.logger.add(new winston.transports.Console({ format: this.getConsoleLogFormat() }));
        this.loggerHTTP.add(new winston.transports.Console({ format: this.getConsoleLogFormat() }));
    }

    /**
     * Log to winston
     * @param level - Logger level
     * @param message - Logger message
     */
    log(level: string, message: string): void {
        this.getLogger().log(level, message);
    }
    /**
     * Log error to winston
     * @param message - Message
     * @param args - args
     */
    error(message: string, args?: any): void {
        this.getLogger().error(message, args);
    }
    /**
     * Log warning to winston
     * @param message - Message
     * @param args - args
     */
    warn(message: string, args?: any): void {
        this.getLogger().warn(message, args);
    }
    /**
     * Log verbose to winston
     * @param message - Message
     * @param args - args
     */
    verbose(message: string, args?: any): void {
        this.getLogger().verbose(message, args);
    }
    /**
     * Log info to winston
     * @param message - Message
     * @param args - args
     */
    info(message: string, args?: any): void {
        this.getLogger().info(message, args);
    }
    /**
     * Log debug to winston
     * @param message - Message
     * @param args - args
     */
    debug(message: string, args?: any): void {
        this.getLogger().debug(message, args);
    }
    /**
     * Log silly to winston
     * @param message - Message
     * @param args - args
     */
    silly(message: string, args?: any): void {
        this.getLogger().silly(message, args);
    }
}

/**
 * Overwrite stream function to throw messages to our http logger
 * @returns Morgan options
 */
export const morganOption: Options = {
    stream: {
        write: (message: string) => {
            const logger = Container.get(LoggerService);
            logger.getHTTPLogger().log('http', message.replace('\n', ''));
        }
    }
};
