import { Body, Get, Post, Put, Res, UseBefore, JsonController, Param } from 'routing-controllers';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode, HTTP_STATUS_CODE } from '../handlers/response.handler';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { User } from '../entities/user/user.model';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController extends ResponseHandler {

    constructor(private userService: UserService) {
        super();
    }
    /**
     * GET request to get all users, needs a valid JWT
     * @param response response object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    public async getUsers(@Res() response: Response): Promise<Response> {
        const userData = await this.userService.findAll();
        return this.createResponse(response, userData, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
    }

    /**
     * GET request to get user by mail, needs a valid JWT
     * @param response response object
     * @param email email parameter
     */
    @Get(':email')
    @UseBefore(JWTMiddleware)
    public async getUserByEmail(@Res() response: Response, @Param('email') email: string): Promise<Response> {
        const userExists = await this.userService.doesExistsEmail(email);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', HTTP_STATUS_CODE.NOT_FOUND, ResponseCode.NOT_FOUND);
        } else {
            const userData = await this.userService.getUserByEmail(email, true);
            return this.createResponse(response, userData, HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
        }
    }

    /**
     * POST request to create a new user in database
     * @param response response object
     * @param user user Object from body
     */
    @Post()
    public async createUser(@Res() response: Response, @Body() user: User): Promise<Response> {
        const userExists = await this.userService.doesExistsEmail(user.email);
        if (userExists) {
            return this.createResponse(response, 'User already registered', HTTP_STATUS_CODE.CONFLICT, ResponseCode.EXISTS);
        } else {
            const result = await this.userService.createUser(user);
            return this.createResponse(response, result, HTTP_STATUS_CODE.CREATED, ResponseCode.SUCCESS_DATA);
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
        const userExists = await this.userService.getUserByID(user.id);
        if (!userExists) {
            return this.createResponse(response, 'User not exists', HTTP_STATUS_CODE.NOT_FOUND, ResponseCode.NOT_FOUND);
        } else {
            const userData = await this.userService.updateUser(user);
            return this.createResponse(response, 'User data saved', HTTP_STATUS_CODE.OK, ResponseCode.SUCCESS_DATA);
        }
    }

}
