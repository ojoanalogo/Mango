import 'reflect-metadata'; // global, required by typeorm and typedi
import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as useContainerRouting } from 'routing-controllers';
import { useContainer as useContainerORM } from 'typeorm';
import { Database } from './database/database';
import { Redis } from './database/redis';
import { ErrorMiddleware } from './middleware/error.middleware';
import { NotFoundMiddleware } from './middleware/not_found.middleware';
import { Logger, LoggerService } from './logger/logger.service';
import { AuthChecker } from './helpers/authorization_checker.helper';
import { CurrenUserChecker } from './helpers/current_user_checker.helper';
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

  constructor(@Logger(__filename) private logger: LoggerService = new LoggerService(__filename)) { }

  public async initialize(): Promise<void> {
    // create express app
    this.app = express();
    // setup express server
    this.setupServer();
    // use container from typeDI
    useContainerORM(Container);
    useContainerRouting(Container);
    try {
      // setup database
      const database: Database = Container.get(Database);
      await database.setupDatabase();
      // setup routing-controllers
      this.setupRouting();
      // setup redis
      const redis: Redis = Container.get(Redis);
      await redis.setupRedis();
    } catch (error) {
      // shutdown app
      this.logger.warn(`Something went wrong while initializing server, see log for details`);
      this.logger.error(error);
      process.exit(1);
    }
  }

  /**
  * Setup express server
  */
  private setupServer(): void {
    this.logger.info('Setting up express server...');
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
    // catch uncaught exceptions
    process.on('uncaughtException', (err) => {
      this.logger.error(err.stack);
    });
  }

  /**
   * Setup routing-controlles
   */
  private setupRouting(): void {
    const authChecker: AuthChecker = Container.get(AuthChecker);
    const currentUserChecker: CurrenUserChecker = Container.get(CurrenUserChecker);
    this.logger.info('Setting up routing-controllers...');
    this.app = useExpressServer(this.app, {
      routePrefix: '/api/v1',
      controllers: [__dirname + '/api/**/*.controller{.js,.ts}'],
      middlewares: [ErrorMiddleware, NotFoundMiddleware],
      cors: true,                     // enable cors
      defaultErrorHandler: false,     // disables error handler so we can use ours
      authorizationChecker: authChecker.authorizationChecker,         // role checker
      currentUserChecker: currentUserChecker.getCurrentUserFromToken	// get user from request
    });
    this.logger.info('Routing setup successfully');
  }

  /**
   * Get express server instance
   * @returns The express server instance
   */
  public getAppInstance(): express.Application {
    return this.app;
  }
}
