import { createClient, RedisClient } from 'redis';
import { Service } from 'typedi/decorators/Service';
import { Logger, LoggerService } from '../components/logger/logger.service';

@Service()
export class Redis {

    private client: RedisClient;
    private redis_host: string = process.env.REDIS_HOST || '127.0.0.1';
    private redis_port: number = parseInt(process.env.REDIS_PORT) || 6379;
    private redis_auth: string = process.env.REDIS_AUTH || '';

    constructor(@Logger(__filename) private logger: LoggerService) { }

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
