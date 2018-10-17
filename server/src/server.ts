import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerTypeORM } from 'typeorm';
import { Database } from './database/database';
import { Redis } from './database/redis';
import { ErrorHandler } from './handlers/error.handler';
import { NotFoundMiddleware } from './middleware/not_found.middleware';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';
import * as httpContext from 'express-http-context';
import * as uuid from 'uuid';

import 'reflect-metadata'; // global, required by typeorm and typedi
import { authorizationChecker } from './services/authorization_checker.service';

process.env.NODE_ENV === 'production' ?
  dotenv.config({ path: path.join(__dirname, '../.env') }) :
  dotenv.config({ path: path.join(__dirname, '../.example.env') });

export class Server {

  public app: express.Application;
  public port: number = parseInt(process.env.PORT) || 1337;

  constructor() {
    // create express app
    this.app = express();
    // use container from typeDI
    useContainerRouting(Container);
    useContainerTypeORM(Container);
    // setup database
    const database: Database = Container.get(Database);
    database.setupDatabase();
    // setup redis
    const redis: Redis = Container.get(Redis);
    redis.setupRedis();
    // setup express server
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
    // support for UUID and route context
    this.app.use(httpContext.middleware);
    this.app.use((req, res, next) => {
      httpContext.set('reqId', uuid.v1());
      httpContext.set('useragent', req.headers['user-agent']);
      httpContext.set('ip', req.ip);
      next();
    });
    // point static path to dist
    this.app.use(express.static(path.join(__dirname, '../public/')));
    // helmet middleware
    this.app.use(helmet());
    // spoof the stack used, just for fun
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Mango');
      next();
    });
    // catch all other routes and return the index file
    this.app.get('^(?!\/api).*$', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
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
      middlewares: [ErrorHandler, NotFoundMiddleware],
      cors: true,                     // enable cors
      defaultErrorHandler: false,     // disables error handler so we can use ours
      authorizationChecker         // role checker
    });
  }

}
