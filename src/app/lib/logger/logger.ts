import { Container } from 'typedi';
import { ILogger } from './logger.interface';
import { LoggerService } from './logger.service';
import path = require('path');

export class ServerLogger implements ILogger {

  private logger: LoggerService;

  /**
   * Creates a log object
   * @param fileName - fileName scope
   */
  constructor(private fileName: string = 'app') {
    // get logger service from Container
    this.logger = Container.get(LoggerService);
  }

  /**
   * This function is used to get origin from logger object (@Logger(__origin))
   * @returns Returns log origin from file
   */
  private getOrigin(): string {
    let origin = this.fileName;
    origin = origin.replace(process.cwd(), '');
    origin = origin.replace(`${path.sep}src${path.sep}`, '');
    origin = origin.replace(`${path.sep}dist${path.sep}`, '');
    origin = origin.replace(/([.]ts)|([.]js)/, '');
    return origin;
  }

  /**
   * Log to winston
   * @param level - Logger level
   * @param message - Logger message
   */
  private log(level: string, message: string, args: any[]): void {
    this.logger.getLogger().log(level, `(${this.getOrigin()}) ${message}`, args);
  }
  /**
   * Log error to winston
   * @param message - Message
   * @param args - optional args
   */
  public error(message: string, args?: any): void {
    this.log('error', message, args);
  }
  /**
   * Log warning to winston
   * @param message - Message
   * @param args - optional args
   */
  public warn(message: string, args?: any): void {
    this.log('warn', message, args);
  }
  /**
   * Log verbose to winston
   * @param message - Message
   * @param args - optional args
   */
  public verbose(message: string, args?: any): void {
    this.log('verbose', message, args);
  }
  /**
   * Log info to winston
   * @param message - Message
   * @param args - optional args
   */
  public info(message: string, args?: any): void {
    this.log('info', message, args);
  }
  /**
   * Log debug to winston
   * @param message - Message
   * @param args - optional args
   */
  public debug(message: string, args?: any): void {
    this.log('debug', message, args);
  }
  /**
   * Log silly to winston
   * @param message - Message
   * @param args - optional args
   */
  public silly(message: string, args?: any): void {
    this.log('silly', message, args);
  }
}
