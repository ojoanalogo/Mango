import * as express from "express";
import * as bodyParser from "body-parser";
import path = require('path');
import morgan = require("morgan");
import { Giuseppe } from 'giuseppe';
import {IndexController} from "controllers/index.controller";

class App {

  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({
      extended: false
    }));
    // morgan log
    this.app.use(morgan('dev'));
    // Point static path to dist
    this.app.use(express.static(path.join(__dirname, '../../dist/client/')));

    // Catch all other routes and return the index file
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
    });


  }

  private routes() {
    const giusi = new Giuseppe();
    giusi.loadControllers("./controllers/**/*.ts").then(()=>{
      giusi.start(1337);
    });
    // this.app.route('/').get((req, res) => {
    //   res.json({
    //     "msg": "hola amigos"
    //   })
    // })
  }


}

export default new App().app;
