import { createClient, RedisClient } from 'redis';
import { Service } from 'typedi/decorators/Service';
import { Logger } from '../utils/logger.util';
const log = Logger.getInstance().getLogger();

@Service()
export class Redis {

    private client: RedisClient;
    private redis_host: string = process.env.REDIS_HOST || '127.0.0.1';
    private redis_port: number = parseInt(process.env.REDIS_PORT) || 6379;
    private redis_auth: string = process.env.REDIS_AUTH || '';

    public async setupRedis() {
        try {
            this.client = createClient({
                host: this.redis_host,
                port: this.redis_port,
                auth_pass: this.redis_auth
            });
            this.client.on('ready', () => {
                log.info('Redis client set-up and running');
            });
        } catch (error) {
            log.warning('Redis client can\'t be setup');
            throw error;
        }
    }
    public async getRedisInstance(): Promise<RedisClient> {
        return this.client;
    }
}
