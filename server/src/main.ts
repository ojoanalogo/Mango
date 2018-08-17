import { Server } from './server';
import { Logger } from './services/logger.service';
const log = Logger.getInstance().getLogger();

class Main extends Server {
  constructor() {
    super();
    this.app.listen(this.port, () => {
      log.info('Running environment: ' + process.env.NODE_ENV);
      log.info('Server is running in port: ' + this.port);
    });
  }
}

export default new Main();
