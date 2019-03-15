#!/usr/bin/env node
import { createServer, Server as HTTPServer } from 'http';
import { App } from './app';
import { Logger, LoggerInterface } from './app/decorators';
import { ServerLogger } from './app/lib/logger';
import { API_PREFIX, ENV, SERVER_HOST, SERVER_PORT } from './config';

/**
 * ⚡ Mango server template
 * ------------------------------------------------------
 *
 * - 📚 Repo: https://github.com/MrARC/Mango
 * - 🤔 Issues: https://github.com/MrARC/Mango/issues
 *
 * Read the 'README.md' file for more information
 * Here our app gets bootstrapped
 */
class Server extends App {

  private httpServer: HTTPServer;
  private host: string = SERVER_HOST;
  private port: number = SERVER_PORT;

  constructor(@Logger(__filename) private readonly serverLogger: LoggerInterface = new ServerLogger(__filename)) {
    super();
    this.initApp();
    this.initDatabase();
    this.createServer();
  }

  /**
   * Create http server instance
   */
  private createServer(): void {
    this.httpServer = createServer(this.getAppInstance());
    this.httpServer.listen(this.port, this.host, () => this.onListening());
    this.httpServer.on('error', (error) => this.handleErrors(<any>error));
  }

  /**
   * On listening event
   */
  private onListening(): void {
    const log = (msg) => this.serverLogger.info(msg);
    const url = `http://${this.host}:${this.port}`;
    const version = 1.0;
    log(`✅  Server is running`);
    log(`🔌  To shut it down press <CTRL> + C from console`);
    log(`✨  Environment: ${ENV}`);
    log(`🚪  Server is listening on: ${url}`);
    log(`📜  Version: ${version}`)
    log(`🌍  API URL: ${url}${API_PREFIX}`);
  }

  /**
   * Handle server runtime errors
   * @param error error object
   */
  private handleErrors(error: ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        this.serverLogger.error(`Server requires elevated privileges to run (using port: ${this.port})`);
        break;
      case 'EADDRINUSE':
        this.serverLogger.error(`Port (${this.port}) already in use`, error);
        break;
      default:
        throw error;
    }
    process.exit(1);
  }
}

/** ErrnoException http error */
interface ErrnoException extends NodeJS.ErrnoException {
  address: string;
  port: number;
}

/** export default new Server instance */
export default new Server();
