import { App } from './app';
import { LoggerService, Logger } from './logger/logger.service';
import { createServer, Server as HttpServer } from 'http';

class Server extends App {

  private port: number = parseInt(process.env.PORT) || 3000;
  private httpServer: HttpServer;

  constructor(@Logger(__filename) private serverLogger: LoggerService = new LoggerService(__filename)) {
    super();
    // call setup
    this.initApp();
    this.initDatabase();
    /**
     * Create http server instance
     */
    this.httpServer = createServer(this.getAppInstance());
    this.httpServer.listen(this.port, () => {
      this.serverLogger.info(`Running environment: ${process.env.NODE_ENV}`);
      this.serverLogger.info(`Server is listening in port: ${this.port}`);
    });
    // pass server runtime errors to our custom function
    this.httpServer.on('error', (error: any) => this.handleErrors(error));
  }

  /**
   * Handle server runtime errors
   * @param error error object
   */
  private handleErrors(error: NodeError): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        this.serverLogger.error(`⚠ Server requires elevated privileges to run (using port: ${error.port})`, error);
        break;
      case 'EADDRINUSE':
        this.serverLogger.error(`⚠ Port (${error.port}) already in use`, error);
        break;
      default:
        throw error;
    }
    process.exit(1);
  }
}

interface NodeError {
  Error: any;
  errno: string;
  code: string;
  syscall: string;
  address: string;
  port: number;
}

// Creates a new instance of the server
export default new Server();
