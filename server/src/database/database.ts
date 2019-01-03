import { Container, Service } from 'typedi';
import { Connection, createConnection, useContainer } from 'typeorm';
import { Logger, LoggerService } from '../logger/logger.service';

@Service()
export class Database {

  private reconnectTry = 1;
  private db_type: any = 'mysql';
  private db_host = process.env.MYSQL_HOST || 'localhost';
  private db_port: number = parseInt(process.env.MYSQL_PORT) || 3306;
  private db_user = process.env.MYSQL_USER || 'root';
  private db_password = process.env.MYSQL_PASSWORD || '';
  private db_name = process.env.MYSQL_DB_NAME || 'mango';
  private db_prefix = process.env.MYSQL_PREFIX || 'mango_';
  private reconnect_seconds = parseInt(process.env.DATABASE_RECONNECT_SECONDS) || 10;
  private reconnect_max_try = parseInt(process.env.DATABASE_MAX_TRY_RECONNECT) || 5;
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
    if (this.connection) {
      // avoid setting up database connection again
      return;
    }
    try {
      // use container from TypeDI
      useContainer(Container);
      this.connection = await createConnection({
        type: this.db_type,
        host: this.db_host,
        port: this.db_port,
        username: this.db_user,
        password: this.db_password,
        database: this.db_name,
        entityPrefix: this.db_prefix,
        entities: [__dirname + '../../api/**/*.model{.js,.ts}'],
        migrations: [__dirname + '../../migration/**/*{.js,.ts}'],
        synchronize: this.syncOption,
        logging: false,
        cache: true
      });
      this.logger.info(`Connected to database (${this.db_name}) successfully`);
      return this.connection;
    } catch (err) {
      await this.reloadDatabase(err);
    }
  }

  /**
   * Try to reconnect to database
   * @param errorMsg - Error message from database
   */
  private async reloadDatabase(err: Error) {
    if (this.reconnectTry > this.reconnect_max_try) {
      throw err;
    }
    // we should try to reconnect a few times
    this.logger.warn(`Can't connect to the ${this.db_type} (${this.db_name}) database! Reason => ${err.message}`);
    this.logger.warn(`Trying to reconnect in ${this.reconnect_seconds} seconds ` +
      `| ${this.reconnectTry}/${this.reconnect_max_try}`);
    this.reconnectTry = this.reconnectTry + 1;
    await this.timeout(this.reconnect_seconds * 1000);
    return this.setupDatabase();
  }

  /**
   * Stop database
   */
  public async stopDatabase(): Promise<void> {
    try {
      await this.connection.close();
    } catch (error) {
      throw error;
    }
  }
}
