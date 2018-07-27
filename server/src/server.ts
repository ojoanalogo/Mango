import { Database } from './database/database';
import { Container } from 'typedi';
import { useExpressServer, useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerTypeORM } from 'typeorm';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as colors from 'colors';
import * as path from 'path';
import * as dotenv from 'dotenv';
import 'reflect-metadata'; // global, required by typegoose and typedi

process.env.NODE_ENV === 'production' ? dotenv.config({ path: '.env' }) : dotenv.config({ path: '.example.env' });
class Server {
  public app: express.Application;

  private port: number = parseInt(process.env.SERVER_PORT) || 1337;

  constructor() {
    this.app = express();
    // use container from typeDI
    useContainerRouting(Container);
    useContainerTypeORM(Container);
    // setup middleware
    this.config();
    // setup database
    const database: Database = Container.get(Database);
    database.setupDatabase();
    // bootstrap express server with routing-controller
    this.app = useExpressServer(this.app, {
      routePrefix: '/api/v1',
      controllers: [__dirname + '/controllers/*{.js,.ts}'],
      cors: true, // enable cors
      classTransformer: false, // this option defaults to true, but caused some problems with typegoose model transformation
      defaultErrorHandler: true, // disables error handler so we can use ours
      defaults: {
        paramOptions: {
          // with this option, argument will be required by default
          required: true
        }
      }
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
