import * as bodyParser from 'body-parser';
import * as expressApp from 'routing-controllers';
import * as express from 'express';
import * as moongose from 'mongoose';
import colors = require('colors');
import path = require('path');
import dotenv = require('dotenv');
import { LoggingMiddleware } from './middleware/logging.middleware';
import 'reflect-metadata';

(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test')
  ? dotenv.config({ path: '.env' }) : dotenv.config({ path: '.example.env' });

class Server {

  public app: express.Application;
  private _port: number = parseInt(process.env.SERVER_PORT) || 1337;
  private _databaseURI: string = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mangoapp';
  private reconnect_max_try = parseInt(process.env.DATABASE_MAX_TRY);
  private reconnect_seconds = 10;
  private reconnect_try = 1;

  constructor() {
    this.app = express();
    // setup middleware
    this.config();
    // setup database
    this.setupDatabase();
    // bootstrap express server with routing-controller
    this.app = expressApp.useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [__dirname + '/controllers/*{.js,.ts}'],
      middlewares: [LoggingMiddleware],
      cors: true, // enable cors
      classTransformer: false, // this option defaults to true, but caused some problems with typegoose model transformation
      defaultErrorHandler: false // disables error handler
    });
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    // point static path to dist
    this.app.use(express.static(path.join(__dirname, '../../dist/client/')));
    // catch all other routes and return the index file
    this.app.get('^(?!\/api).*$', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
    });
    this.app.listen(this._port, () => {
      console.log(colors.green(`Server is running in port: `) + colors.cyan(`${this._port}`));
    });
  }

  /**
   * Setup database
   */
  private setupDatabase() {
    console.log(this._databaseURI);
    moongose.connect(this._databaseURI, {
      autoReconnect: true, // use this option to allow database to reconnect
      useNewUrlParser: true // use this to avoid deprecation warning
    }).then(() => {
      console.log(colors.green(`Connected to database (${this._databaseURI}) successfully`));
    }).catch((error) => {
      // we should try to reconnect a few times
      console.error(colors.red(`Can't connect to the mongodb database!\nReason => ` + colors.white(`${error}`)));
      console.log(colors.white(`Trying to reconnect in ${this.reconnect_seconds} seconds ` +
        `| ${this.reconnect_try}/${this.reconnect_max_try}`));

      setTimeout(() => {
        this.reconnect_try++;
        // if we can't reconnect to database after X times, we will stop trying to do so
        if (this.reconnect_try > this.reconnect_max_try) {
          console.error(colors.red('Timed out trying to reconnect to mongodb database'));
          return false;
        }
        this.setupDatabase();
      }, 1000 * this.reconnect_seconds);
    });
  }
}

export default new Server();
