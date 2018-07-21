import { Get, UseBefore, JsonController, Res } from 'routing-controllers';
import { Response } from 'express';
import { ResponseHandler, ResponseCode, HTTP_STATUS_CODE } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';

@JsonController()
@UseBefore(LoggingMiddleware)
export class IndexController extends ResponseHandler {

    /**
     * GET request for Hello API
     * @param response response Object
     */
    @Get('')
    public index(@Res() response: Response) {
        return this.createResponse(response, 'Welcome to our API endpoint!', HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
    }
}
