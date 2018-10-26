import * as request from 'supertest';
import * as setup from '../setup';
import { App } from '../../../src/app';
import 'reflect-metadata';

const app = new App().getAppInstance();

describe('Index API Routes', () => {
    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------
    beforeAll(async () => {

    });


    // -------------------------------------------------------------------------
    // Tear down
    // -------------------------------------------------------------------------
    afterAll(async () => {

    });
    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('It should response the GET method', async () => {
        const response = await request(app).get('/api/v1/');
        return expect(response.status).toBe(200);
    });
    test('It should return a body with format', async () => {
        const response = await request(app).get('/api/v1/');
        return expect(response.body).toEqual({
            data: 'Welcome to our API endpoint',
            statusCode: 200,
        });
    });
});
