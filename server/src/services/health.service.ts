import { Service } from 'typedi';

@Service()
export class HealthService {

    constructor() { }

    /**
     * Returns health status
     */
    public getHealth() {
        return 'Ping pong';
    }

}
