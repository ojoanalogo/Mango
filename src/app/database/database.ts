import { Container, Service } from 'typedi';
import { Connection, createConnection, useContainer, QueryRunner } from 'typeorm';
import { Logger } from '../decorators';
import { ServerLogger } from '../lib/logger';
import { DB_OPTIONS, DB_NAME, DB_RETRY_SECCONDS, DB_RETRY_MAX_ATTEMPTS } from '../../config';

@Service()
export class Database {

  private connection: Connection;
  private reconnectTry = 1;

  constructor(@Logger(__filename) private logger: ServerLogger) { }

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
      await this.connection.connect();
      return this.connection;
    }
    try {
      // use container from TypeDI
      useContainer(Container);
      this.connection = await createConnection(DB_OPTIONS);
      this.logger.info(`Connected to database (${DB_NAME}) successfully`);
      return this.connection;
    } catch (err) {
      await this.retryConnection(err);
    }
  }

  /**
   * Try to reconnect to database
   * @param errorMsg - Error message from database
   */
  private async retryConnection(err: Error) {
    if (this.reconnectTry > DB_RETRY_MAX_ATTEMPTS) {
      throw err;
    }
    // we should try to reconnect a few times
    this.logger.warn(`Can't connect to the mysql (${DB_NAME}) database! Reason => ${err.message}`);
    this.logger.warn(`Trying to reconnect in ${DB_RETRY_SECCONDS} seconds ` +
      `| ${this.reconnectTry}/${DB_RETRY_MAX_ATTEMPTS}`);
    this.reconnectTry = this.reconnectTry + 1;
    await this.timeout(DB_RETRY_SECCONDS * 1000);
    return this.setupDatabase();
  }

  public async executeQuery(query: string, ...args: any[]): Promise<QueryRunner> {
    try {
      return this.connection.createQueryRunner().query(query, args);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset database
   */
  public async resetDatabase() {
    try {
      await this.connection.dropDatabase();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stop database
   */
  public async stopDatabase(): Promise<void> {
    try {
      if (this.connection.isConnected) {
        await this.connection.close();
      }
    } catch (error) {
      throw error;
    }
  }
}
