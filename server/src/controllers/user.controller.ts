import { Param, Get, Post, Res, UseBefore, JsonController, Body } from 'routing-controllers';
import { Response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode } from '../util/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController extends ResponseHandler {

    @Get()
    @UseBefore(JWTMiddleware)
    public async test(@Res() response: Response) {
        console.log('fired');
        return 'aa';
    }

    @Post()
    public async createUser(@Res() response: Response, @Body() user: User) {
        if (UserService.doesExist(user.email)) {
            try {
                const result = await UserService.createUser(user);
                return this.createResponse(response, result, 200, ResponseCode.SUCCESS_DATA);
            } catch (ex) {
                return this.createResponse(response, 'Unable to register user', 500, ResponseCode.ERROR);
            }
        }
        return this.createResponse(response, 'User already registered', 409, ResponseCode.ERROR);
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
            return this.createResponse(response, 'Unable to get user', 500, ResponseCode.NOT_FOUND);
        }
    }

}
