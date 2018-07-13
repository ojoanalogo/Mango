import { Param, Get, Post, Res, UseBefore, JsonController, Body, Middleware } from 'routing-controllers';
import { Response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode } from '../util/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController extends ResponseHandler {

    @Post()
    public async createUser(@Res() response: Response, @Body() user: User) {
        try {
            const result = await UserService.createUser(user);
            return this.createResponse(response, result, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to register user (user already registered)', 500, ResponseCode.ERROR);
        }
    }

    @Get(':email')
    public async getUserByEmail(@Res() response: Response, @Param('email') email: string) {
        try {
            const userData = await UserService.getUserByEmail(email);
            if (userData == null) {
                return this.createResponse(response, 'User data not found', 404, ResponseCode.NOT_FOUND);
            }
            return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get user', 404, ResponseCode.NOT_FOUND);
        }
    }

}
