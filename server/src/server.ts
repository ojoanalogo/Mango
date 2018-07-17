import { Database } from './database/database.config';
import { Mongoose } from 'mongoose';
import * as bodyParser from 'body-parser';
import * as expressApp from 'routing-controllers';
import * as express from 'express';
import colors = require('colors');
import path = require('path');
import dotenv = require('dotenv');
import 'reflect-metadata';

process.env.NODE_ENV === 'production' ?  dotenv.config({ path: '.env' }) : dotenv.config({ path: '.example.env' });

class Server {
  public app: express.Application;

  private port: number = parseInt(process.env.SERVER_PORT) || 1337;
  private databaseURI: string = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mangoapp';
  private reconnect_seconds = parseInt(process.env.DATABASE_RECONNECT_SECONDS);
  private reconnect_max_try = parseInt(process.env.DATABASE_MAX_TRY);
  private db: Mongoose;

  constructor() {
    this.app = express();
    // setup middleware
    this.config();
    // setup database
    this.db = new Database(this.databaseURI, this.reconnect_seconds, this.reconnect_max_try).getDatabase();
    // bootstrap express server with routing-controller
    this.app = expressApp.useExpressServer(this.app, {
      routePrefix: '/api/v1',
      controllers: [__dirname + '/controllers/*{.js,.ts}'],
      cors: true, // enable cors
      classTransformer: false, // this option defaults to true, but caused some problems with typegoose model transformation
      defaultErrorHandler: false // disables error handler
    });
  }

  private config(): void {
    console.log('Running environment: ' + process.env.NODE_ENV);
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
    // spoof the stack used, just for fun
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Aura');
      next();
    });
    this.app.listen(this.port, () => {
      console.log(colors.green(`Server is running in port: `) + colors.cyan(`${this.port}`));
    });
  }
}

export default new Server();
