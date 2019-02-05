import { Container } from 'typedi';
import { ServerLogger } from '../lib/logger/';

/**
 * @Logger decorator
 * @param fileName - Filename context
 */
export function Logger(fileName: string) {
  return function (object: Object, propertyName: string, index?: number) {
    const logger = new ServerLogger(fileName);
    Container.registerHandler({ object, propertyName, index, value: () => logger });
  };
}
