import { Post, UseBefore, JsonController, Res, Body, Get } from 'routing-controllers';
import { Response } from 'express';
import { ResponseHandler, ResponseCode, HTTP_STATUS_CODE } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { UserService } from '../services/user.service';
import { User } from '../entities/user/user.model';

@JsonController('/auth/')
@UseBefore(LoggingMiddleware)
export class AuthController extends ResponseHandler {

    constructor(private userService: UserService) {
        super();
    }

    @Post()
    public async login(@Res() response: Response, @Body() user: User): Promise<Response> {
        const userExists = await this.userService.doesExistsEmail(user.email);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', HTTP_STATUS_CODE.NOT_FOUND, ResponseCode.NOT_FOUND);
        } else {
            try {
                const loginResponse = await this.userService.loginUser(user);
                return loginResponse ?
                this.createResponse(response, loginResponse, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA) :
                this.createResponse(response, 'Wrong password', HTTP_STATUS_CODE.UNAUTHORIZED, ResponseCode.NOT_AUTHORIZED);
            } catch (error) {
                return this.createResponse(response, 'Could not get user data',
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR);
            }
        }
    }
}
