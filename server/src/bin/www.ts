import { App } from '../app';
import { LoggerService } from '../components/logger/logger.service';
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
      log.info('Running environment: ' + process.env.NODE_ENV);
      log.info('Server is running in port: ' + this.getPort());
    });
  }
}

// Creates a new instance of the server
export default new Server();
