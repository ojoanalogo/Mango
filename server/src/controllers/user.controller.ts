import {
    Body, Get, Delete, Post, Res, UseBefore,
    JsonController, Param, NotFoundError, BadRequestError, InternalServerError, Authorized, Patch, QueryParam, Req
} from 'routing-controllers';
import { Response, Request } from 'express';
import { Validator } from 'class-validator';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { UserService } from '../services/user.service';
import { LoggingMiddleware } from '../middleware/http_logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { User } from '../entities/user/user.model';
import { RoleType } from '../entities/user/user_role.model';
import { TokenRepository } from '../repositories/token.repository';

@JsonController('/me')
@UseBefore(LoggingMiddleware)
export class MeController {
    constructor(private userService: UserService, private tokenRepository: TokenRepository) { }
    @Get()
    @UseBefore(JWTMiddleware)
    public async getProfile(@Req() request: Request, @Res() response: Response): Promise<Response> {
        const userData = await this.tokenRepository.findUserByToken(request['token']);
        if (!userData) {
            throw new NotFoundError('Cannot find user associated to token');
        }
        const userProfile = await this.userService.getUserByEmail(userData.email);
        return new ApiResponse(response)
            .withData(userProfile)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }
}

@JsonController('/users/')
@UseBefore(LoggingMiddleware)
export class UserController {

    constructor(private userService: UserService) { }
    /**
     * GET request to get all users, needs a valid JWT
     * @param response response Object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    @Authorized([RoleType.DEVELOPER])
    public async getUsers(@Res() response: Response, @QueryParam('page') page = 0): Promise<Response> {
        const userData = await this.userService.findAll(page);
        return new ApiResponse(response)
            .withData(userData)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    /**
     * GET request to get user by mail, needs a valid JWT
     * @param response response Object
     * @param email email parameter
     */
    @Get(':email')
    @UseBefore(JWTMiddleware)
    public async getUserByEmail(@Res() response: Response, @Param('email') email: string): Promise<Response> {
        const userDB = await this.userService.getUserByEmail(email);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        return new ApiResponse(response)
            .withData(userDB)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    /**
     * POST request to create a new user in database
     * @param response response Object
     * @param user user Object from body
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
        const userDB = await this.userService.getUserByEmail(user.email);
        if (userDB) {
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
    @Delete(':id')
    @UseBefore(JWTMiddleware)
    @Authorized([RoleType.DEVELOPER])
    public async deleteUserByID(@Res() response: Response, @Param('id') id: number): Promise<Response> {
        const userDB = await this.userService.getUserByID(id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        } else {
            const rs = await this.userService.deleteUserByID(id);
            if (!rs) {
                throw new InternalServerError('Cannot delete user from database');
            }
            return new ApiResponse(response)
                .withData('User removed from database')
                .withStatusCode(HTTP_STATUS_CODE.OK)
                .build();
        }
    }

    /**
     * Updates user with ID supplied
     * @param response response Object
     * @param user user Object
     */
    @Patch()
    @UseBefore(JWTMiddleware)
    public async updateUserByID(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
        const userDB = await this.userService.getUserByID(user.id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        } else {
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
}
