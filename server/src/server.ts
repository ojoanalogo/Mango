import * as bodyParser from 'body-parser';
import * as expressApp from 'routing-controllers';
import * as express from 'express';
import * as moongose from 'mongoose';
import { IndexController } from './controllers/index.controller';
import colors = require('colors');
import path = require('path');
import 'reflect-metadata';

require('dotenv').config();

class Server {

  public app: express.Application;
  // tslint:disable-next-line:radix
  private _port: number = parseInt(process.env.SERVER_PORT) || 1337;
  private _databaseURI: string = process.env.DATABASE_STRING_URL || 'mongodb://127.0.0.1/mangoapp';

  constructor() {
    this.app = expressApp.createExpressServer({
        routePrefix: '/api',
        controllers: [IndexController]
    });
    this.app.listen(this._port, () => {
        console.log(colors.green(`Server is running in port: `) + colors.cyan(`${this._port}`));
    });
    this.config();
    this.setupDatabase();
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({
      extended: false
    }));
    // point static path to dist
    this.app.use(express.static(path.join(__dirname, '../../dist/client/')));
    // catch all other routes and return the index file
    this.app.get('^(?!\/api).*$', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
    });
  }

  private setupDatabase() {
   moongose.connect(this._databaseURI, {
     autoReconnect: true,
   }).then(() => {
     console.log(colors.green(`Connected to database (${this._databaseURI}) successfully`));
   }).catch((error) => {
     console.error(colors.red(`Can't connect to the mongodb database!\nReason => ` + colors.white(`${error}`)));
   });
  }
}

export default new Server();
