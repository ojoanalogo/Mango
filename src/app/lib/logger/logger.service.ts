import { Format } from 'logform';
import { Service } from 'typedi';
import { IS_PRODUCTION } from '../../../config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as httpContext from 'express-http-context';

@Service()
export class LoggerService {

  private logger: winston.Logger;
  private loggerHTTP: winston.Logger;

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
  * Common logger format, we strip colors and add a Timestamp
  * @returns LogFormat
  */
  private getFileLogFormat(): Format {
    const addContext = winston.format(info => {
      const reqID = this.getRequestUUID();
      if (reqID) {
        info.requestID = reqID;
      }
      return info;
    });
    return winston.format.combine(
      winston.format.uncolorize(),
      winston.format.timestamp(),
      addContext(),
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
        const format = `${ts} | ${level} ` +
          `${this.getRequestUUID() ? ` | ${this.getRequestUUID()} ` : ''} »` +
          ` ${message.replace('\t', '')} ${Object.keys(args).length ? ('\n' + JSON.stringify(args, null, 2)) : ''}`;
        return format;
      })
    );
  }

  /**
   * Setup main logger
   */
  private setupLogger() {
    this.logger = winston.createLogger();
    this.loggerHTTP = winston.createLogger();
    if (IS_PRODUCTION) {
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
      this.logger.add(transportError);
      this.logger.add(transportCombined);
      this.loggerHTTP.add(transportHTTP);
    }
  }

  /**
   * Setup console stream
   */
  private setupConsoleStream() {
    this.logger.add(new winston.transports.Console({ format: this.getConsoleLogFormat() }));
    this.loggerHTTP.add(new winston.transports.Console({ format: this.getConsoleLogFormat() }));
  }

  /**
   * Get request context (UUID)
   * @returns request context
   */
  private getRequestUUID(): string {
    const reqId = httpContext.get('reqId');
    return reqId;
  }

}

