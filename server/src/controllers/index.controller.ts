import { Get, UseBefore, JsonController, Res } from 'routing-controllers';
import { Response } from 'express';
import { ResponseHandler, ResponseCode } from '../util/response.handler';
import morgan = require('morgan');

@JsonController()
@UseBefore(morgan('dev'))
export class IndexController extends ResponseHandler {

    @Get('')
    public index(@Res() response: Response) {
        return this.createResponse(response, 'Welcome to our API endpoint!', 200, ResponseCode.SUCCESS_DATA);
    }
}
