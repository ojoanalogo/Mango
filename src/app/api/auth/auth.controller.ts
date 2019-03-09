import { Validator } from 'class-validator';
import { Response } from 'express';
import { BadRequestError, Body, JsonController, NotFoundError, Post, Res, UnauthorizedError, UseBefore } from 'routing-controllers';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';
import { User } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { AuthService } from './auth.service';

@JsonController('/auth/')
@UseBefore(LoggingMiddleware)
export class AuthController {

  constructor(private userService: UserService, private authService: AuthService) { }

  /**
   * POST Request to Login user with email and password data
   * @param response - Response object
   * @param user - User object
   * @returns Login response
   */
  @Post()
  public async login(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
    const validator = new Validator();
    if (!validator.isEmail(user.email) || validator.isEmpty(user.email)) {
      throw new BadRequestError('Not valid email');
    }
    if (validator.isEmpty(user.password)) {
      throw new BadRequestError('Password field empty');
    }
    const userDB = await this.userService.userExistsByEmail(user.email);
    if (!userDB) {
      throw new NotFoundError('User not exists');
    }
    const loginResponse = await this.authService.loginUser(user);
    if (loginResponse) {
      return new ApiResponse(response)
        .withData(loginResponse)
        .withStatusCode(HTTP_STATUS_CODE.OK)
        .build();
    } else {
      throw new UnauthorizedError('Wrong password');
    }
  }
}
