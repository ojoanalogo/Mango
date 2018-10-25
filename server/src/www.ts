import { App } from './app';
import { Logger } from './services/logger.service';
import { Container } from 'typedi';
import { createServer } from 'http';

class Server extends App {
  constructor() {
    super();
    /**
     * Create http server instance
     */
    const server = createServer(this.getAppInstance());
    server.listen(this.getPort(), () => {
      const log = Container.get(Logger);
      log.getLogger()
        .info('Running environment: ' + process.env.NODE_ENV);
      log.getLogger()
        .info('Server is running in port: ' + this.getPort());
    });
  }
}

export default new Server();
