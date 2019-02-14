import { Service } from 'typedi';
import { Logger } from '../../decorators/logger.decorator';
import { ServerLogger } from '../../lib/logger';
import { IHealth } from './health.interface';


@Service()
export class HealthService {

  private startTime: Date;

  constructor(@Logger(__filename) private readonly logger: ServerLogger) {
    this.startTime = new Date();
  }

  /**
   * Returns health status
   * @returns Health status
   */
  public getHealth(): IHealth {
    function pad(time: number): string {
      return (time < 10 ? '0' : '') + time;
    }
    const uptime = process.uptime();
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor(uptime % (60 * 60) / 60);
    const seconds = Math.floor(uptime % 60);
    const formatted = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    return {
      ping: 'pong',
      start: this.startTime,
      uptime: uptime,
      uptime_formatted: formatted
    };
  }
}
