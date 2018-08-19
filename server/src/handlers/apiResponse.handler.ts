import { Response } from 'express';
import { serialize } from 'class-transformer';

export class ApiResponse {

    private statusCode: HTTP_STATUS_CODE = 200;
    private data: any;
    private stackTrace: any;

    constructor(private _response: Response) { }
    /**
     * Adds data to the Response object
     * @param data data object
     */
    public withData(data: any): ApiResponse {
        this.data = data;
        return this;
    }
    /**
     * If needed, add stacktrace to the
     * @param stackTrace stackTrace
     */
    public withStackTrace(stackTrace: any) {
        this.stackTrace = stackTrace;
        return this;
    }
    /**
     * What status code should we return
     * @param statusCode statusCode
     */
    public withStatusCode(statusCode: HTTP_STATUS_CODE): ApiResponse {
        this.statusCode = statusCode;
        return this;
    }

    /**
     * Creates a response object from a set of parameters
     * @returns {Response} response object with the defined payload
     */
    public build(): Response {
        return this._response
            .status(this.statusCode)
            .type('json')
            .send(serialize(<ApiResponse>this,
                { enableCircularCheck: true, excludePrefixes: ['_'] }));
    }
}

/**
 * HTTP status codes from httpstatuses
 */
export enum HTTP_STATUS_CODE {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    REQUEST_ENTITY_TOO_LARGE = 413,
    REQUEST_URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505
}
