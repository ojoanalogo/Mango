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
            try {
                const loginResponse = await UserService.loginUser(user);
                return loginResponse ?
                this.createResponse(response, loginResponse, 200, ResponseCode.SUCCESS_DATA) :
                this.createResponse(response, 'Wrong password', 401, ResponseCode.NOT_FOUND);
            } catch (error) {
                return this.createResponse(response, 'Could not get user data', 500, ResponseCode.NOT_FOUND);
            }
        }
    }
}
