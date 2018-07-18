import * as mongoose from 'mongoose';
import colors = require('colors');

export class Database {

    private dbOject: mongoose.Mongoose;
    private reconnectTry = 1;
    /**
     * Database constructor
     * @param databaseURI MongoDB database URI
     * @param reconnectSeconds Interval between reconnect try
     * @param reconnectMaxTry Maximum tries to reconnect to database
     */
    constructor(private databaseURI: string, private reconnectSeconds: number, private reconnectMaxTry: number) {
        this.setupDatabase();
    }

   /**
   * Setup database
   * @returns {Promise<void>} Promise with the operation result
   */
    private async setupDatabase(): Promise<void> {
        try {
            mongoose.set('bufferCommands', false); // dissable buffer if connection goes down, this unblocks API query results
            const db = await mongoose.connect(this.databaseURI, {
                autoReconnect: true, // use this option to allow database to reconnect
                useNewUrlParser: true // use this to avoid deprecation warning,
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
     * @returns {mongoose.Mongoose} mongoose Object
     */
    public getDatabase(): mongoose.Mongoose {
        return this.dbOject;
    }
}
