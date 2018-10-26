import { Service } from 'typedi';

@Service()
export class HealthService {

    constructor() { }

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
        return {
            ping: 'pong',
            uptime: uptime,
            uptime_formatted: formatted
        };
    }

}
