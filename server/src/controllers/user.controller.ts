import { Body, Get, Post, Put, Res, UseBefore, JsonController, Param, NotFoundError } from 'routing-controllers';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { User } from '../entities/user/user.model';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/apiResponse.handler';

@JsonController('/user/')
@UseBefore(LoggingMiddleware)
export class UserController {

    constructor(private userService: UserService) { }
    /**
     * GET request to get all users, needs a valid JWT
     * @param response response object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    public async getUsers(@Res() response: Response): Promise<Response> {
        const userData = await this.userService.findAll();
        return new ApiResponse(response)
            .withData(userData)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
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
            throw new NotFoundError('User not found');
        } else {
            const userData = await this.userService.getUserByEmail(email, true);
            return new ApiResponse(response)
                .withData(userData)
                .withStatusCode(HTTP_STATUS_CODE.OK).build();
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
            return new ApiResponse(response)
                .withData('User already registered')
                .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
                .build();
        } else {
            const result = await this.userService.createUser(user);
            return new ApiResponse(response)
                .withData(result)
                .withStatusCode(HTTP_STATUS_CODE.CREATED)
                .build();
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
            throw new NotFoundError('User not found');
        } else {
            const userData = await this.userService.updateUser(user);
            return new ApiResponse(response)
                .withData('User data saved')
                .withStatusCode(HTTP_STATUS_CODE.OK)
                .build();
        }
    }

}
