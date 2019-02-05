import { Container } from 'typedi';
import { LoggerService } from './logger.service';
import * as path from 'path';

/**
 * Logger Interface
 */
interface ILogger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  verbose(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  silly(message: string, ...args: any[]): void;
}

export class ServerLogger implements ILogger {

  private logger: LoggerService;

  /**
   * Creates a log object
   * @param fileName - fileName scope
   */
  constructor(private fileName: string = 'app') {
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

  public http() {
    return this.logger.getHTTPLogger();
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
   * @param args - args
   */
  public error(message: string, args?: any): void {
    this.log('error', message, args);
  }
  /**
   * Log warning to winston
   * @param message - Message
   * @param args - args
   */
  public warn(message: string, args?: any): void {
    this.log('warn', message, args);
  }
  /**
   * Log verbose to winston
   * @param message - Message
   * @param args - args
   */
  public verbose(message: string, args?: any): void {
    this.log('verbose', message, args);
  }
  /**
   * Log info to winston
   * @param message - Message
   * @param args - args
   */
  public info(message: string, args?: any): void {
    this.log('info', message, args);
  }
  /**
   * Log debug to winston
   * @param message - Message
   * @param args - args
   */
  public debug(message: string, args?: any): void {
    this.log('debug', message, args);
  }
  /**
   * Log silly to winston
   * @param message - Message
   * @param args - args
   */
  public silly(message: string, args?: any): void {
    this.log('silly', message, args);
  }
}
