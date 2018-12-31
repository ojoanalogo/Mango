import { App } from './app';
import { LoggerService, Logger } from './logger/logger.service';
import { createServer } from 'http';

interface NodeError {
  Error: any;
  errno: string;
  code: string;
  syscall: string;
  address: string;
  port: number;
}

class Server extends App {

  private port: number = parseInt(process.env.PORT) || 3000;

  constructor(@Logger(__filename) private serverLogger: LoggerService = new LoggerService(__filename)) {
    super();
    this.initialize();
    /**
     * Create http server instance
     */
    const server = createServer(this.getAppInstance());
    server.listen(this.port, () => {
      this.serverLogger.info(`Running environment: ${process.env.NODE_ENV}`);
      this.serverLogger.info(`Server is listening in port: ${this.port}`);
    });
    // Handle server errors
    server.on('error', (error: any) => this.handleErrors(error));
  }

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

// Creates a new instance of the server
export default new Server();
