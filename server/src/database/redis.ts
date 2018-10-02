import { createClient, RedisClient } from 'redis';

export class Redis {

    client: RedisClient;
    constructor() {
        this.client = createClient();
    }
}
