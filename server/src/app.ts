import 'reflect-metadata'; // global, required by typeorm and typedi
import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerORM } from 'typeorm';
import { Database } from './database/database';
import { Redis } from './database/redis';
import { ErrorMiddleware } from './middleware/error.middleware';
import { NotFoundMiddleware } from './middleware/not_found.middleware';
import { AuthChecker } from './services/authorization_checker.service';
import * as httpContext from 'express-http-context';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';
import * as uuid from 'uuid';

// setup dotenv
dotenv.config({ path: path.join(__dirname, '../.env') });

export class App {

  private app: express.Application;
  private port: number = parseInt(process.env.PORT) || 1337;

  constructor() { }

  public async initialize(): Promise<void> {
    // check env variables
    this.checkEnvVariables();
    // create express app
    this.app = express();
    // use container from typeDI
    useContainerORM(Container);
    useContainerRouting(Container);
    // setup redis
    const redis: Redis = Container.get(Redis);
    redis.setupRedis();
    // setup express server
    this.config();
    // setup database
    const database: Database = Container.get(Database);
    await database.setupDatabase();
    // setup routing-controllers
    this.routerConfig();
  }

  /**
   * Check environment variables before starting server
   */
  private checkEnvVariables(): void {
    [
      'NODE_ENV',
      'PORT'
    ].forEach((name) => {
      if (!process.env[name]) {
        console.error(`Environment variable ${name} is missing`);
        process.exit(0);
      }
    });
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
      authorizationChecker: authChecker.authorizationChecker,         // role checker
      currentUserChecker: authChecker.getUserFromToken
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
