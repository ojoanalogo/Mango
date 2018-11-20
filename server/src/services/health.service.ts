import { Service } from 'typedi';
import { Logger, LoggerService } from './logger.service';
import { getConnection } from 'typeorm';

@Service()
export class HealthService {

    constructor(@Logger() private logger: LoggerService) { }

    /**
     * Returns health status
     * @returns Health status
     */
    public getHealth() {
        function pad(time: number): string {
            return (time < 10 ? '0' : '') + time;
        }
        const uptime = process.uptime();
        const hours = Math.floor(uptime / (60 * 60));
        const minutes = Math.floor(uptime % (60 * 60) / 60);
        const seconds = Math.floor(uptime % 60);
        const formatted = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        const dbHealth = getConnection().isConnected ? 'alive' : 'dead';
        this.logger.getLogger().info('Uptime: ' + formatted);
        return {
            ping: 'pong',
            uptime: uptime,
            uptime_formatted: formatted,
            database: dbHealth
        };
    }

}
