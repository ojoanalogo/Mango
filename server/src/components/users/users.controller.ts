import {
    Body, Get, Delete, Post, Res, UseBefore,
    JsonController, Param, NotFoundError,
    BadRequestError, InternalServerError,
    Authorized, Patch, QueryParam
} from 'routing-controllers';
import { Response } from 'express';
import { Validator } from 'class-validator';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { UserService } from './user.service';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';
import { User } from './user.model';
import { RoleType } from './user_role.model';

@JsonController('/users/')
@UseBefore(LoggingMiddleware)
export class UserController {

    constructor(private userService: UserService) { }
    /**
     * GET request to get all users
     * @param response - Response object
     * @param page - Page number
     * @returns User list
     */
    @Get()
    @Authorized({
        roles: [RoleType.DEVELOPER]
    })
    public async getUsers(@Res() response: Response, @QueryParam('page') page = 0): Promise<Response> {
        const userData = await this.userService.findAll(page);
        return new ApiResponse(response)
            .withData(userData)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    /**
     * GET request to get user by ID
     * @param response - Response object
     * @param id - ID parameter
     * @returns User specified from ID
     */
    @Get(':id')
    @Authorized({
        roles: [RoleType.DEVELOPER]
    })
    public async getUserByID(@Res() response: Response, @Param('id') id: number): Promise<Response> {
        const userDB = await this.userService.getUserByID(id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        return new ApiResponse(response)
            .withData(userDB)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    /**
     * POST request to create a new user in database
     * @param response - Response object
     * @param user - User object from body
     * @returns Created user data
     */
    @Post()
    public async createUser(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
        const validator = new Validator();
        if (!validator.isEmail(user.email) || validator.isEmpty(user.email)) {
            throw new BadRequestError('Not valid email');
        }
        if (validator.isEmpty(user.password)) {
            throw new BadRequestError('Password field empty');
        }
        if (user.password !== undefined && validator.isEmpty(user.password)) {
            throw new BadRequestError('Password field empty');
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(user.password)) {
            throw new BadRequestError('Password must be at least 8 characters and have one letter and one number');
        }
        const userExists = await this.userService.userExistsByEmail(user.email);
        if (userExists) {
            return new ApiResponse(response)
                .withData('User already registered')
                .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
                .build();
        }
        const result = await this.userService.createUser(user);
        return new ApiResponse(response)
            .withData(result)
            .withStatusCode(HTTP_STATUS_CODE.CREATED)
            .build();
    }

    /**
     * Updates user with ID supplied
     * @param response - Response object
     * @param id - User ID
     * @returns Delete result
     */
    @Delete(':id')
    @Authorized({
        roles: [RoleType.DEVELOPER]
    })
    public async deleteUserByID(@Res() response: Response, @Param('id') id: number): Promise<Response> {
        if (!id) {
            throw new BadRequestError('ID field is required');
        }
        const userDB = await this.userService.getUserByID(id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        const rs = await this.userService.deleteUserByID(id);
        if (!rs) {
            throw new InternalServerError('Cannot delete user from database');
        }
        return new ApiResponse(response)
            .withData('User removed from database')
            .withStatusCode(HTTP_STATUS_CODE.OK)
            .build();
    }

    /**
     * Updates user with ID supplied
     * @param response - Response object
     * @param user - User object
     * @returns Update result
     */
    @Patch()
    @Authorized({
        roles: [RoleType.DEVELOPER]
    })
    public async updateUserByID(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
        if (!user.id) {
            throw new BadRequestError('ID field is required');
        }
        const userDB = await this.userService.getUserByID(user.id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        if (userDB.email === user.email) {
            return new ApiResponse(response)
                .withData('User already registered')
                .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
                .build();
        }
        await this.userService.updateUser(user);
        return new ApiResponse(response)
            .withData('User data saved')
            .withStatusCode(HTTP_STATUS_CODE.OK)
            .build();
    }
}
