import { Service } from 'typedi';
import { createClient, RedisClient } from 'redis';
import { Logger } from '../decorators';
import { ServerLogger } from '../lib/logger';

@Service()
export class Redis {

  private client: RedisClient;
  private redis_host: string = process.env.REDIS_HOST || '127.0.0.1';
  private redis_port: number = parseInt(process.env.REDIS_PORT) || 6379;
  private redis_auth: string = process.env.REDIS_AUTH || '';

  constructor(@Logger(__filename) private logger: ServerLogger) { }

  public async setupRedis() {
    this.client = createClient({
      host: this.redis_host,
      port: this.redis_port,
      auth_pass: this.redis_auth
    });
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
