import { Post, UseBefore, JsonController, Res, Body } from 'routing-controllers';
import { Response } from 'express';
import { ResponseHandler, ResponseCode } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@JsonController('/auth/')
@UseBefore(LoggingMiddleware)
export class AuthController extends ResponseHandler {

    @Post()
    public async login(@Res() response: Response, @Body() user: User) {
        const userExists = await UserService.doesExistsEmail(user.email);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', 404, ResponseCode.NOT_FOUND);
        } else {
            const loginResponse = await UserService.loginUser(user);
            if (loginResponse) {
                const userData = await UserService.getUserByEmail(user.email);
                return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
            }
            return this.createResponse(response, 'Wrong password', 404, ResponseCode.NOT_FOUND);
        }
    }
}
