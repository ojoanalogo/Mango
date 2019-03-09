import { Format, TransformableInfo } from 'logform';
import { Service } from 'typedi';
import { LOG_FOLDER, LOG_LEVEL, LOG_TO_FILE } from '../../../config';
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
      const clusterID = this.getClusterID();
      if (reqID) {
        info.requestID = reqID;
      }
      if (clusterID) {
        info.clusterID = clusterID;
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
      winston.format.colorize({
        colors: {
          http: 'magenta'
        }
      }), // add color to the level tag
      winston.format.timestamp(), // add timestamp key
      /** custom log format */
      winston.format.printf((info: TransformableInfo) => {
        // unpack variables
        const { timestamp, level, message, clusterID, requestID, ...args } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        // logger format to console
        const format =
          `${ts} |\t${level}\t»` +
          `${this.getRequestUUID() ? ` reqId: ${this.getRequestUUID()}` : ''} ` +
          `${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        return format;
      }));
  }

  /**
   * Setup main logger
   */
  private setupLogger() {
    this.logger = winston.createLogger({ level: LOG_LEVEL });
    this.loggerHTTP = winston.createLogger({ level: 'http', levels: { http: 1 } });
    if (LOG_TO_FILE) {
      // setup transports
      const transportError = new DailyRotateFile({
        level: 'error',
        filename: path.join(process.cwd(), `${LOG_FOLDER}/error-%DATE%.log`),
        format: this.getFileLogFormat(),
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '31d'
      });
      const transportCombined = new DailyRotateFile({
        level: 'info',
        filename: path.join(process.cwd(), `${LOG_FOLDER}/combined-%DATE%.log`),
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
        filename: path.join(process.cwd(), `${LOG_FOLDER}/http/http-%DATE%.log`),
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

  /**
   * Get cluster ID if present
   * @returns cluster ID
   */
  private getClusterID(): string {
    const clusterID = process.env.pm_id;
    return clusterID;
  }

}

