import { Container } from 'typedi';
import { WinstonLogger } from './logger.service';
import winston = require('winston');

export class HTTPLogger {

  /**
   * Returns Winston HTTP logger instance
   */
  public getHttpLogger(): winston.Logger {
    const logger = Container.get(WinstonLogger);
    return logger.getHTTPLogger();
  }
}
