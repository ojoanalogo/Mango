import { Mongoose, connect as dbConnect } from 'mongoose';
import colors = require('colors');

export class Database {

    private dbOject: Mongoose;
    private reconnectTry: 1;
    constructor(private databaseURI: string, private reconnectSeconds: number, private reconnectMaxTry: number) {
        this.setupDatabase();
    }

    /**
   * Setup database
   */
    private async setupDatabase(): Promise<void> {
        try {
            const db = await dbConnect(this.databaseURI, {
                autoReconnect: true, // use this option to allow database to reconnect
                useNewUrlParser: true // use this to avoid deprecation warning
            });
            if (db) {
                console.log(colors.green(`Connected to database (${this.databaseURI}) successfully`));
                this.dbOject = db;
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
        console.error(colors.red(`Can't connect to the mongodb database!\nReason => ` + colors.white(`${errorMsg}`)));
        console.log(colors.white(`Trying to reconnect in ${this.reconnectSeconds} seconds ` +
            `| ${this.reconnectTry}/${this.reconnectMaxTry}`));
        setTimeout(() => {
            this.reconnectTry++;
            // if we can't reconnect to database after X times, we will stop trying to do so
            if (this.reconnectTry > this.reconnectMaxTry) {
                console.error(colors.red('Timed out trying to reconnect to mongodb database'));
                return false;
            }
            this.setupDatabase();
        }, 1000 * this.reconnectSeconds);
    }

    /**
     * Returns database object
     */
    public getDatabase(): Mongoose {
        return this.dbOject;
    }
}
