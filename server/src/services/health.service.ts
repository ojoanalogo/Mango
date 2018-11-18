import { Service } from 'typedi';
import { Logger, LoggerService } from './logger.service';

@Service()
export class HealthService {

    constructor(@Logger() private logger: LoggerService) { }

    /**
     * Returns health status
     * @returns Health status
     */
    public getHealth() {
        function pad(s) {
            return (s < 10 ? '0' : '') + s;
        }
        const uptime = process.uptime();
        const hours = Math.floor(uptime / (60 * 60));
        const minutes = Math.floor(uptime % (60 * 60) / 60);
        const seconds = Math.floor(uptime % 60);
        const formatted = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        this.logger.getLogger().info('Uptime: ' + formatted);
        return {
            ping: 'pong',
            uptime: uptime,
            uptime_formatted: formatted
        };
    }

}
