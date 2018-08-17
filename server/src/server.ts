import { Database } from './database/database';
import { Container } from 'typedi';
import { ErrorHandler } from './handlers/error.handler';
import { useExpressServer } from 'routing-controllers';
import { useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerTypeORM } from 'typeorm';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';
import 'reflect-metadata'; // global, required by typeorm and typedi

process.env.NODE_ENV === 'production' ? dotenv.config({ path: '.env' }) : dotenv.config({ path: '.example.env' });

export class Server {

  public app: express.Application;
  public port: number = parseInt(process.env.SERVER_PORT) || 1337;

  constructor() {
    // create express app
    this.app = express();
    // use container from typeDI
    useContainerRouting(Container);
    useContainerTypeORM(Container);
    // setup database
    const database: Database = Container.get(Database);
    database.setupDatabase();
    this.config();
    this.routerConfig();
  }

  /**
  * Setup express server
  * @returns void
  */
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
    // helmet middleware
    this.app.use(helmet());
    // spoof the stack used, just for fun
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Aura');
      next();
    });
  }

  /**
   * Setup routing-controller
   * @returns void
   */
  private routerConfig(): void {
    this.app = useExpressServer(this.app, {
      routePrefix: '/api/v1',
      controllers: [__dirname + '/controllers/*{.js,.ts}'],
      middlewares: [ErrorHandler],
      cors: true, // enable cors
      defaultErrorHandler: false // disables error handler so we can use ours
    });
  }

}
