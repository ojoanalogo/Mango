import { Param, Put, Get, Post, Res, UseBefore, JsonController, Body } from 'routing-controllers';
import { Response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController extends ResponseHandler {

    /**
     * POST request to create a new user in database
     * @param response response object
     * @param user user Object from body
     */
    @Post()
    public async createUser(@Res() response: Response, @Body() user: User) {
        const userExists = await UserService.doesExists(user.email);
        if (userExists) {
            return this.createResponse(response, 'User already registered', 409, ResponseCode.EXISTS);
        } else {
            try {
                const result = await UserService.createUser(user);
                return this.createResponse(response, result, 200, ResponseCode.SUCCESS_DATA);
            } catch (ex) {
                return this.createResponse(response, 'Unable to register user', 500, ResponseCode.ERROR);
            }
        }
    }

    /**
     * GET request to get user by mail, needs a valid JWT
     * @param response response object
     * @param email email parameter
     */
    @Get(':email')
    @UseBefore(JWTMiddleware)
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

    @Put()
    @UseBefore(JWTMiddleware)
    public async updateUserByJWT(@Res() response: Response, @Body() user: User) {
        try {
            console.log(user);
            const userData = await UserService.updateUserById(user._id, user);
            return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get user', 500, ResponseCode.NOT_FOUND);
        }
    }

}
