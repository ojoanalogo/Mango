import { createClient, RedisClient } from 'redis';
import { Service } from 'typedi';
import { REDIS_OPTIONS } from '../../config';
import { Logger } from '../decorators';
import { ServerLogger } from '../lib/logger';

@Service()
export class Redis {

  private client: RedisClient;

  constructor(@Logger(__filename) private readonly logger: ServerLogger) { }

  public async setupRedis() {
    this.client = createClient(REDIS_OPTIONS);
    this.client.on('ready', () => {
      this.logger.info('Redis client set-up and running');
    });
    this.client.on('error', () => {
      this.logger.warn('Redis client can\'t be setup');
      this.client.quit();
    });
  }
  public async getRedisInstance(): Promise<RedisClient> {
    return this.client;
  }
}
