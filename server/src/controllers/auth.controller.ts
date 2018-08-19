import { Post, UseBefore, JsonController, Res, Body, NotFoundError, UnauthorizedError, InternalServerError } from 'routing-controllers';
import { Response } from 'express';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { UserService } from '../services/user.service';
import { User } from '../entities/user/user.model';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/apiResponse.handler';

@JsonController('/auth/')
@UseBefore(LoggingMiddleware)
export class AuthController {

    constructor(private userService: UserService) { }

    @Post()
    public async login(@Res() response: Response, @Body() user: User): Promise<Response> {
        const userExists = await this.userService.doesExistsEmail(user.email);
        const apiResponse = new ApiResponse(response);
        if (!userExists) {
            throw new NotFoundError('User not exists');
        } else {
            try {
                const loginResponse = await this.userService.loginUser(user);
                if(loginResponse) {
                    return apiResponse
                        .withData(loginResponse)
                        .withStatusCode(HTTP_STATUS_CODE.OK)
                        .build()
                }
                throw new UnauthorizedError('Wrong password');
            } catch (error) {
                throw new InternalServerError('Could not get user data')
            }
        }
    }
}
