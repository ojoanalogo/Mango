import { Server } from './server';
import { Logger } from './services/logger.service';
import { Container } from 'typedi';

class App extends Server {
  constructor() {
    super();
    if (process.env.NODE_ENV !== 'test') {
      this.app.listen(this.port, () => {
        const log = Container.get(Logger);
        log.getLogger()
          .info('Running environment: ' + process.env.NODE_ENV);
        log.getLogger()
          .info('Server is running in port: ' + this.port);
      });
    }
  }
}

export default new App().app;
