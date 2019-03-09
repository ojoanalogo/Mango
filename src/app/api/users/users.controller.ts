import { Validator } from 'class-validator';
import { Response } from 'express';
import {
  Authorized, BadRequestError, Body, Delete, ForbiddenError, Get,
  InternalServerError, JsonController, NotFoundError, Param, Patch, Post, QueryParam, Res, UseBefore
} from 'routing-controllers';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';
import { User } from './user.entity';
import { UserService } from './user.service';
import { RoleType } from './user_role.entity';

@JsonController('/users/')
@UseBefore(LoggingMiddleware)
export class UserController {

  constructor(private readonly userService: UserService) { }

  /**
   * GET request to get all users
   * @param response - Response object
   * @param page - Page number
   * @returns User list
   */
  @Get()
  // @Authorized([RoleType.DEVELOPER])
  public async getUsers(@Res() response: Response, @QueryParam('page') page?: number,
    @QueryParam('limit') limit?: number): Promise<Response> {
    const maxLimit = 100;
    if (limit > maxLimit) {
      throw new BadRequestError(`Please request less users, max quantity: ${maxLimit}`);
    }
    const userData = await this.userService.findAll(page, limit);
    return new ApiResponse(response)
      .withStatusCode(HTTP_STATUS_CODE.OK)
      .withData(userData)
      .build();
  }

  /**
   * GET request to get user by ID
   * @param response - Response object
   * @param id - ID parameter
   * @returns User specified from ID
   */
  @Get(':id')
  // @Authorized([RoleType.DEVELOPER])
  public async getUserByID(@Res() response: Response, @Param('id') id: number): Promise<Response> {
    const userDB = await this.userService.getUserByID(id);
    if (!userDB) {
      throw new NotFoundError(`User ID (${id}) not found`);
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
    if (!user.email) {
      throw new BadRequestError('Please provide a valid email field');
    }
    if (!validator.isEmail(user.email) || validator.isEmpty(user.email)) {
      throw new BadRequestError('Not valid email');
    }
    if (user.password === undefined || validator.isEmpty(user.password)) {
      throw new BadRequestError('Password field empty');
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(user.password)) {
      throw new BadRequestError('Password must be at least 8 characters and have one letter and one number');
    }
    const userExists = await this.userService.userExistsByEmail(user.email);
    if (userExists) {
      throw new ForbiddenError(`User with email (${user.email}) already exists`);
    }
    if (userExists) {
      return new ApiResponse(response)
        .withData('User already registered')
        .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
        .build();
    }
    const userCreated = await this.userService.createUser(user);
    return new ApiResponse(response)
      .withData(userCreated)
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
  @Authorized([RoleType.DEVELOPER])
  public async deleteUserByID(@Res() response: Response, @Param('id') id: number): Promise<Response> {
    if (!id) {
      throw new BadRequestError('ID field is required');
    }
    const userDB = await this.userService.userExistsByID(id);
    if (!userDB) {
      throw new NotFoundError(`User ID (${id}) not found`);
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
  @Patch(':id')
  @Authorized([RoleType.DEVELOPER])
  public async updateUserByID(@Res() response: Response, @Param('id') id: number, @Body({ required: true }) user: User): Promise<Response> {
    const validator = new Validator();
    if (!id) {
      throw new BadRequestError('ID field is required');
    }
    const userDB = await this.userService.userExistsByID(id);
    if (!userDB) {
      throw new NotFoundError(`User ID (${id}) not found`);
    }
    if (user.email) {
      const usedEmail = await this.userService.getUserByEmail(user.email);
      if (usedEmail) {
        return new ApiResponse(response)
          .withData('Email already in use')
          .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
          .build();
      }
      if (!validator.isEmail(user.email) || validator.isEmpty(user.email)) {
        throw new BadRequestError('Not valid email');
      }
    }
    await this.userService.updateUser(id, user);
    return new ApiResponse(response)
      .withData('User data saved')
      .withStatusCode(HTTP_STATUS_CODE.OK)
      .build();
  }
}
