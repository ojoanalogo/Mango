import { Param, Put, Get, Post, Res, UseBefore, JsonController, Body } from 'routing-controllers';
import { Response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode, HTTP_STATUS_CODE } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController extends ResponseHandler {

    /**
     * GET request to get all users, needs a valid JWT
     * @param response response object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    public async getUsers(@Res() response: Response) {
        try {
            const userData = await UserService.getUsers(100);
            return this.createResponse(response, userData, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get users', HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR);
        }
    }

    /**
     * POST request to create a new user in database
     * @param response response object
     * @param user user Object from body
     */
    @Post()
    public async createUser(@Res() response: Response, @Body() user: User) {
        const userExists = await UserService.doesExistsEmail(user.email);
        if (userExists) {
            return this.createResponse(response, 'User already registered', HTTP_STATUS_CODE.CONFLICT, ResponseCode.EXISTS);
        } else {
            try {
                const result = await UserService.createUser(user);
                return this.createResponse(response, result, HTTP_STATUS_CODE.CREATED, ResponseCode.SUCCESS_DATA);
            } catch (ex) {
                return this.createResponse(response, 'Unable to register user', HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR);
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
        const userExists = await UserService.doesExistsEmail(email);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', HTTP_STATUS_CODE.NOT_FOUND, ResponseCode.NOT_FOUND);
        } else {
            try {
                const userData = await UserService.getUserByEmail(email);
                return this.createResponse(response, userData, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
            } catch (ex) {
                return this.createResponse(response, 'Unable to get user', HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR);
            }
        }
    }

    /**
     * Updates user with ID supplied
     * @param response response Object
     * @param user user Object
     */
    @Put()
    @UseBefore(JWTMiddleware)
    public async updateUserByID(@Res() response: Response, @Body() user: User) {
        const userExists = await UserService.doesExistsId(user._id);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', HTTP_STATUS_CODE.NOT_FOUND, ResponseCode.NOT_FOUND);
        } else {
            try {
                const userData = await UserService.updateUserById(user._id, user);
                return this.createResponse(response, userData, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
            } catch (ex) {
                return this.createResponse(response, 'Unable to get user', HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, ResponseCode.ERROR);
            }
        }
    }

}
