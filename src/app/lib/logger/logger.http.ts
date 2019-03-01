import { Container } from 'typedi';
import { LoggerService } from './logger.service';
import winston = require('winston');

export class HTTPLogger {

  /**
   * Returns Winston HTTP logger instance
   */
  public getHttpLogger(): winston.Logger {
    const logger = Container.get(LoggerService);
    return logger.getHTTPLogger();
  }
}
