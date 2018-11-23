import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerTypeORM } from 'typeorm';
import { Database } from './database/database';
import { Redis } from './database/redis';
import { ErrorMiddleware } from './middleware/error.middleware';
import { NotFoundMiddleware } from './middleware/not_found.middleware';
import { AuthChecker } from './services/authorization_checker.service';
import httpContext = require('express-http-context');
// import * as httpContext from 'express-http-context';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';
import * as uuid from 'uuid';

import 'reflect-metadata'; // global, required by typeorm and typedi

process.env.NODE_ENV === 'production' ?
  dotenv.config({ path: path.join(__dirname, '../.env') }) :
  dotenv.config({ path: path.join(__dirname, '../.example.env') });

export class App {

  private app: express.Application;
  private port: number = parseInt(process.env.PORT) || 1337;

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
  */
  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    // helmet middleware
    this.app.use(helmet());
    // spoof the stack used, just for fun
    this.app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Mango');
      next();
    });
    // support for UUID and route context
    this.app.use(httpContext.middleware);
    this.app.use((req, res, next) => {
      httpContext.set('reqId', uuid.v1());
      httpContext.set('useragent', req.headers['user-agent']);
      httpContext.set('ip', req.ip);
      next();
    });
    // point static path to public
    this.app.use(express.static(path.join(__dirname, '../public')));
    // catch all other routes and return the index file (Angular frontend)
    // enable this to use a frontend client and let it use his own router
    // this.app.get('^(?!\/api).*$', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
    // });
  }

  /**
   * Setup routing-controlles
   */
  private routerConfig(): void {
    const authChecker: AuthChecker = Container.get(AuthChecker);
    this.app = useExpressServer(this.app, {
      routePrefix: '/api/v1',
      controllers: [__dirname + '/controllers/*{.js,.ts}'],
      middlewares: [ErrorMiddleware, NotFoundMiddleware],
      cors: true,                     // enable cors
      defaultErrorHandler: false,     // disables error handler so we can use ours
      authorizationChecker: authChecker.authorizationChecker         // role checker
    });
  }

  /**
   * Get express server instance
   * @returns The express server instance
   */
  public getAppInstance(): express.Application {
    return this.app;
  }
  /**
   * Get desired express server port
   * @returns The express server port
   */
  public getPort(): number {
    return this.port;
  }
}
