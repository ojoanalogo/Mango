import { Service } from 'typedi';
import { Logger, LoggerService } from '../../logger/logger.service';
import { getConnection } from 'typeorm';


@Service()
export class HealthService {

  private startTime: Date;

  constructor(@Logger(__filename) private logger: LoggerService) {
    this.startTime = new Date();
  }

  /**
   * Returns health status
   * @returns Health status
   */
  public getHealth(): Health {
    function pad(time: number): string {
      return (time < 10 ? '0' : '') + time;
    }
    const uptime = process.uptime();
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor(uptime % (60 * 60) / 60);
    const seconds = Math.floor(uptime % 60);
    const formatted = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    const dbHealth = getConnection().isConnected ? 'alive' : 'dead';
    return {
      ping: 'pong',
      start: this.startTime,
      uptime: uptime,
      uptime_formatted: formatted,
      database: dbHealth
    };
  }
}
interface Health {
  ping: string;
  start: Date;
  uptime: number;
  uptime_formatted: string;
  database: 'alive' | 'dead';
}
