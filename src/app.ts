import 'reflect-metadata'; // global, required by typeorm and typedi
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { Database } from './app/database/database';
import { Redis } from './app/database/redis';
import { Logger, LoggerInterface } from './app/decorators';
import { AuthHelper, CurrentUserHelper } from './app/helpers';
import { ServerLogger } from './app/lib/logger';
import { ErrorMiddleware } from './app/middleware/error.middleware';
import { NotFoundMiddleware } from './app/middleware/not_found.middleware';
import { API_PREFIX } from './config';
import express = require('express');
import httpContext = require('express-http-context');
import bodyParser = require('body-parser');
import uuid = require('uuid');
import helmet = require('helmet');
import path = require('path');

export class App {

  private app: express.Application = express();

  constructor(@Logger(__filename) private readonly logger: LoggerInterface = new ServerLogger(__filename)) { }

  /**
   * Initialize application with routing controllers
   */
  public async initApp(): Promise<void> {
    try {
      // setup express server
      await this.setupExpress();
      // setup routing-controllers
      await this.setupRouting();
    } catch (error) {
      // shutdown app
      this.logger.warn(`Something went wrong while initializing server, see log for details:`);
      this.logger.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Initialize database
   */
  public async initDatabase(): Promise<void> {
    try {
      // setup database
      const database: Database = Container.get(Database);
      await database.setupDatabase();
      // setup redis
      const redis: Redis = Container.get(Redis);
      await redis.setupRedis();
    } catch (error) {
      this.logger.warn(`Something went wrong while initializing database, see log for details`);
      this.logger.error(error.stack);
    }
  }

  /**
  * Setup express server
  */
  private async setupExpress(): Promise<void> {
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
    this.app.use((_req, res, next) => {
      res.setHeader('X-Powered-By', 'Mango');
      next();
    });
    // support for UUID and route context
    this.app.use(httpContext.middleware);
    this.app.use((req, _res, next) => {
      httpContext.set('reqId', uuid.v1());
      httpContext.set('useragent', req.headers['user-agent']);
      httpContext.set('ip', req.ip);
      next();
    });
    // point static path to public
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    // catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error(error.stack);
    });
  }

  /**
   * Setup routing-controlles
   * @returns Express app
   */
  private async setupRouting(): Promise<express.Application> {
    this.logger.info('Setting up routing-controllers...');
    // use TypeDI container in routing-controllers
    useContainer(Container);
    const authChecker: AuthHelper = Container.get(AuthHelper);
    const currentUserChecker: CurrentUserHelper = Container.get(CurrentUserHelper);
    this.app = useExpressServer(this.app, {
      routePrefix: API_PREFIX,
      controllers: [path.join(__dirname, '/app/api/**/*.controller{.js,.ts}')],
      middlewares: [ErrorMiddleware, NotFoundMiddleware],
      cors: true,                     // enable cors
      defaultErrorHandler: false,     // disables error handler so we can use ours
      authorizationChecker: authChecker.authorizationChecker,         // role checker
      currentUserChecker: currentUserChecker.getCurrentUserFromToken	// get user from request
    });
    this.logger.info('Routing setup successfully');
    return this.app;
  }

  /**
   * Get express server instance
   * @returns The express server instance
   */
  public getAppInstance(): express.Application {
    return this.app;
  }
}
