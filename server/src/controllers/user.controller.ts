import { Param, Get, Res, UseBefore, JsonController } from 'routing-controllers';
import { Response} from 'express';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode } from '../util/response.handler';
import * as morgan from 'morgan';

@JsonController('/v1/user/')
@UseBefore(morgan('dev'))
export class UserController extends ResponseHandler {

    @Get()
    public async getUsers(@Res() response: Response) {
        try {
            const userData = await UserService.getUsers(100);
            return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get users', 500, ResponseCode.ERROR);
        }
    }

    @Get(':email')
    public async getUserByEmail(@Res() response: Response, @Param('email') email: string) {
        try {
            const userData = await UserService.getUserByEmail(email);
            return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get user', 500, ResponseCode.ERROR);
        }
    }

}
