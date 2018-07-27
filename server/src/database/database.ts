import * as colors from 'colors';
import { Service } from 'typedi';
import { Connection, createConnection } from 'typeorm';

@Service()
export class Database {

    private reconnectTry = 1;
    private db_type: any = process.env.DATABASE_TYPE || 'mysql';
    private db_host = process.env.DATABASE_HOST || 'localhost';
    private db_port: number = parseInt(process.env.DATABASE_PORT) || 3306;
    private db_user = process.env.DATABASE_USER || 'root';
    private db_password = process.env.DATABASE_PASSWORD || '';
    private db_name = process.env.DATABASE_NAME || 'mango';
    private reconnect_seconds = parseInt(process.env.DATABASE_RECONNECT_SECONDS);
    private reconnect_max_try = parseInt(process.env.DATABASE_MAX_TRY);
    private connection: Connection;

    constructor() { }

    /**
    * Setup database
    * @returns {Promise<void>} Promise with the operation result
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
                entities: [__dirname.replace('database', 'entities') + '/**/*{.js,.ts}'],
                synchronize: true,
                logging: false
            });
            if (this.connection) {
                console.log(colors.green(`Connected to database (${this.db_host}|${this.db_name}) successfully`));
                return this.connection;
            }
        } catch (error) {
            this.retry(error);
        }
    }

    /**
     * Try to reconnect to database
     * @param errorMsg Error message from database
     */
    private retry(errorMsg: string): void {
        // we should try to reconnect a few times
        console.error(colors.red(`Can't connect to the ${this.db_type} (${this.db_name}) database!\nReason => `
            + colors.white(`${errorMsg}`)));
        console.log(colors.white(`Trying to reconnect in ${this.reconnect_seconds} seconds ` +
            `| ${this.reconnectTry}/${this.reconnect_max_try}`));
        setTimeout(() => {
            this.reconnectTry++;
            // if we can't reconnect to database after X times, we will stop trying to do so
            if (this.reconnectTry > this.reconnect_max_try) {
                console.error(colors.red('Timed out trying to reconnect to mongodb database'));
                return false;
            }
            this.setupDatabase();
        }, 1000 * this.reconnect_seconds);
    }
}
