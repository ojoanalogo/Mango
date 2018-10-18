import * as request from 'supertest';
import * as server from '../../src/main';

describe('/api/v1 should return object and status code 200', () => {
    test('It should response the GET method', async () => {
        const response = await request(server.default).get('/api/v1/');
        return expect(response.status).toBe(200);
    });
    test('It should return a body with format', async () => {
        const response = await request(server.default).get('/api/v1/');
        return expect(response.body).toEqual({
            data: 'Welcome to our API endpoint!',
            statusCode: 200,
        });
    });
});
