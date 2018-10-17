import { Server } from './server';
import { Logger } from './utils/logger.util';
const log = Logger.getInstance().getLogger();

class Main extends Server {
  server: Express.Application;
  constructor() {
    super();
    this.server = this.app.listen(this.port, () => {
      log.info('Running environment: ' + process.env.NODE_ENV);
      log.info('Server is running in port: ' + this.port);
    });
  }

  getServerInstance(): Express.Application {
    return this.server;
  }
}

export default new Main().getServerInstance();
