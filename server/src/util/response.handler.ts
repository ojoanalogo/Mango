import { Response } from 'express';

export class ResponseHandler {

    /**
     * Creates a response object from a set of parameters
     * @param response - Response object
     * @param payload - Data payload object
     * @param httpCode - HttpCode (must be http standard)
     * @param responseCode - ResponseCode (for use in app)
     */
    createResponse(response: Response, payload: any, httpCode: number, responseCode: ResponseCode) {
        return response.status(httpCode).json({
           status: responseCode,
           data: payload,
        });
    }
}

export enum ResponseCode {
    SUCCESS_DATA = 1,
    ERROR = 0,
}
