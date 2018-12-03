import { App } from './app';
import { LoggerService } from './services/logger.service';
import { Container } from 'typedi';
import { createServer } from 'http';

class Server extends App {
  constructor() {
    super();
    this.initialize();
    /**
     * Create http server instance
     */
    const server = createServer(this.getAppInstance());
    server.listen(this.getPort(), () => {
      const log = Container.get(LoggerService);
      log.getLogger()
        .info('Running environment: ' + process.env.NODE_ENV);
      log.getLogger()
        .info('Server is running in port: ' + this.getPort());
    });
  }
}

// Creates a new instance of the server
export default new Server();
