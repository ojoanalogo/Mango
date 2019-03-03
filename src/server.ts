import { App } from './app';
import { ServerLogger } from './app/lib/logger';
import { createServer, Server as HTTPServer } from 'http';
import { SERVER_PORT, SERVER_HOST, ENV, API_PREFIX } from './config';

class Server extends App {

  private httpServer: HTTPServer;
  private host: string = SERVER_HOST;
  private port: number = SERVER_PORT;

  constructor(private readonly serverLogger: ServerLogger = new ServerLogger(__filename)) {
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
    const url = `http://${this.host}:${this.port}`;
    this.serverLogger.info(`Running environment: ${ENV}`);
    this.serverLogger.info(`Server is listening in: ${url}`);
    this.serverLogger.info(`API URL: ${url}${API_PREFIX}`);
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
