import { Format, TransformableInfo } from 'logform';
import { Service } from 'typedi';
import { IS_PRODUCTION } from '../../../config';
import winston = require('winston');
import DailyRotateFile = require('winston-daily-rotate-file');
import path = require('path');
import httpContext = require('express-http-context');

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
      winston.format.colorize(), // add color to the level tag
      winston.format.timestamp(), // add timestamp key
      winston.format.printf((info: TransformableInfo) => {
        // unpack variables
        const { timestamp, level, message, ...args } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        const format =
          `${ts} |\t${level}` +
          `${this.getRequestUUID() ? `\t| ${this.getRequestUUID()}` : ''}` +
          `\t» ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        return format;
      }));
  }

  /**
   * Setup main logger
   */
  private setupLogger() {
    this.logger = winston.createLogger({ level: 'info' });
    this.loggerHTTP = winston.createLogger({ level: 'http', levels: { http: 1 } });
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
        level: 'http',
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
    const consoleFormat = {
      format: this.getConsoleLogFormat()
    };
    this.logger.add(new winston.transports.Console(consoleFormat));
    this.loggerHTTP.add(new winston.transports.Console(consoleFormat));
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

