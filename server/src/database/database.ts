import { Service } from 'typedi';
import { Connection, createConnection } from 'typeorm';
import { Logger, LoggerService } from '../logger/logger.service';

@Service()
export class Database {

    private reconnectTry = 1;
    private db_type: any = process.env.DATABASE_TYPE || 'mysql';
    private db_host = process.env.DATABASE_HOST || 'localhost';
    private db_port: number = parseInt(process.env.DATABASE_PORT) || 3306;
    private db_user = process.env.DATABASE_USER || 'root';
    private db_password = process.env.DATABASE_PASSWORD || '';
    private db_name = process.env.DATABASE_NAME || 'mango';
    private db_prefix = process.env.DATABASE_PREFIX || 'mango_';
    private reconnect_seconds = parseInt(process.env.DATABASE_RECONNECT_SECONDS);
    private reconnect_max_try = parseInt(process.env.DATABASE_MAX_TRY);
    private connection: Connection;
    private syncOption = process.env.NODE_ENV === 'production' ? false : true;

    constructor(@Logger(__filename) private logger: LoggerService) { }

    private timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
    * Setup database
    * @returns Promise with the operation result
    */
    public async setupDatabase(): Promise<Connection> {
        try {
            this.connection = await createConnection({
                type: this.db_type,
                host: this.db_host,
                port: this.db_port,
                username: this.db_user,
                password: this.db_password,
                database: this.db_name,
                entityPrefix: this.db_prefix,
                entities: [__dirname + '../../**/*.model{.js,.ts}'],
                migrations: [__dirname + '../../migration/**/*{.js,.ts}'],
                synchronize: this.syncOption,
                logging: false,
                cache: true
            });
            this.logger.info(`Connected to database (${this.db_name}) successfully`);
            return this.connection;
        } catch (err) {
            if (this.reconnectTry > this.reconnect_max_try) {
                this.logger.error(`Timed out trying to connect to the ${this.db_type} database`, err);
                throw err;
            }
            // we should try to reconnect a few times
            this.logger.error(`Can't connect to the ${this.db_type} (${this.db_name}) database! Reason => ${err}`);
            this.logger.warn(`Trying to reconnect in ${this.reconnect_seconds} seconds ` +
                `| ${this.reconnectTry}/${this.reconnect_max_try}`);
            this.reconnectTry = this.reconnectTry + 1;
            await this.timeout(this.reconnect_seconds * 1000);
            return this.setupDatabase();
        }
    }
    /**
     * Stop database
     */
    public async stopDatabase() {
        await this.connection.close();
    }
}
