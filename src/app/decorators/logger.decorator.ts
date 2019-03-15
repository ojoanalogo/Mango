import { Container } from 'typedi';
import { ServerLogger } from '../lib/logger/';

/**
 * @Logger decorator
 * @param fileName - Filename context
 */
export const Logger = (fileName: string): (object: Object, propertyName: string, index?: number) => void => {
  return (object: Object, propertyName: string, index?: number) => {
    const logger = new ServerLogger(fileName);
    Container.registerHandler({ object, propertyName, index, value: () => logger });
  };
};

export { LoggerInterface } from '../lib/logger/logger.interface';
