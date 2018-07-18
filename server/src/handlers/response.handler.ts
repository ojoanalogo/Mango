import { Response } from 'express';

export class ResponseHandler {

    /**
     * Creates a response object from a set of parameters
     * @param response - Response object
     * @param payload - Data payload object
     * @param httpCode - HttpCode (must be http standard)
     * @param responseCode - ResponseCode (for use in app)
     * @returns {Response} response object with the defined payload
     */
    createResponse(response: Response, payload: any, httpCode: number, responseCode: ResponseCode): Response {
        return response.status(httpCode).json({
            status: responseCode,
            data: payload
        });
    }
}

/**
 * Response codes
 */
export enum ResponseCode {
    SUCCESS_DATA = 1,
    ERROR = -1,
    NOT_FOUND = 2,
    EXISTS = 3
}
