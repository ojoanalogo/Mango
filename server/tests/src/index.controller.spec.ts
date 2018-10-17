import * as request from 'supertest';
import * as server from '../../src/main';

describe('/api/v1 should return object and status code 200', () => {
    test('It should response the GET method', async () => {
        const response = await request(server.default).get('/api/v1/');
        expect(response.status).toBe(200);
    });
});
