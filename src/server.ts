import { App } from './app';
import { ServerLogger } from './app/lib/logger';
import { createServer, Server as HttpServer } from 'http';
import { SERVER_PORT, SERVER_HOST, ENV } from './config';

class Server extends App {

  private host: string = SERVER_HOST;
  private port: number = SERVER_PORT;
  private httpServer: HttpServer;

  constructor(private readonly serverLogger: ServerLogger = new ServerLogger(__filename)) {
    super();
    this.initApp();
    this.initDatabase();
    /**
     * Create http server instance
     */
    this.httpServer = createServer(this.getAppInstance());
    this.httpServer.listen(this.port, this.host, () => this.onListening());
    this.httpServer.on('error', (error) => this.handleErrors(error));
  }

  /**
   * On listening event
   */
  private onListening(): void {
    this.serverLogger.info(`Running environment: ${ENV}`);
    this.serverLogger.info(`Server is listening in: ${this.port}`);
  }

  /**
   * Handle server runtime errors
   * @param error error object
   */
  private handleErrors(error: any): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        this.serverLogger.error(`Server requires elevated privileges to run (using port: ${error.port})`);
        break;
      case 'EADDRINUSE':
        this.serverLogger.error(`Port (${error.port}) already in use`, error);
        break;
      default:
        throw error;
    }
    process.exit(1);
  }
}

export default new Server();
