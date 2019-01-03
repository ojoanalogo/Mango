import {
  Body, Get, Res, UseBefore,
  JsonController, BadRequestError, Authorized, Req, Put, CurrentUser
} from 'routing-controllers';
import { Response, Request } from 'express';
import { Validator } from 'class-validator';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { UserService } from '../users/user.service';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';
import { User } from '../users/user.model';
import { UploadUtils } from '../../utils/upload.utils';
import * as multer from 'multer';

@JsonController('/me')
@UseBefore(LoggingMiddleware)
export class MeController {

  constructor(private userService: UserService) { }

  /**
   * GET request to get user profile info
   * @param request - Request object
   * @param user - Current User object
   * @returns User profile
   */
  @Get()
  @Authorized()
  public async getProfile(@Res() response: Response, @CurrentUser() user: User): Promise<Response> {
    const userProfile = await this.userService.getUserByID(user.id);
    return new ApiResponse(response)
      .withData(userProfile)
      .withStatusCode(HTTP_STATUS_CODE.OK).build();
  }

  /**
   * PUT request to update user profile info
   * @param response - Response object
   * @param request - Request object
   * @param user - Current user object
   * @returns Update profile result
   */
  @Put()
  @Authorized()
  public async updateProfile(@Res() response: Response, @CurrentUser() currentUser: User,
    @Body({ required: true }) user: User): Promise<Response> {
    const userdb = await this.userService.getUserByEmail(user.email);
    if (userdb) {
      return new ApiResponse(response)
        .withData('User email already in use')
        .withStatusCode(HTTP_STATUS_CODE.CONFLICT)
        .build();
    }
    const validator = new Validator();
    if (user.email !== undefined && (!validator.isEmail(user.email) || validator.isEmpty(user.email))) {
      throw new BadRequestError('Not valid email');
    }
    if (user.password !== undefined && validator.isEmpty(user.password)) {
      throw new BadRequestError('Password field empty');
    }
    if (user.password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(user.password)) {
      throw new BadRequestError('Password must be at least 8 characters and have one letter and one number');
    }
    if (user.first_name !== undefined && validator.isEmpty(user.first_name)) {
      throw new BadRequestError('First name is empty');
    }
    if (user.second_name !== undefined && validator.isEmpty(user.second_name)) {
      throw new BadRequestError('Second name is empty');
    }
    user.id = currentUser.id;
    const newData = await this.userService.updateUser(currentUser.id, user);
    return new ApiResponse(response)
      .withData(newData)
      .withStatusCode(HTTP_STATUS_CODE.OK)
      .build();
  }

  /**
   * PUT request to update user profile picture
   * @param response - Response object
   * @param request - Request object
   * @param user - Current user object
   * @returns Update profile picture result
   */
  @Put('/profile_picture')
  @UseBefore(multer(UploadUtils.getProfileUploadMulterOptions()).single('profile_picture'))
  @Authorized()
  public async updateProfilePicture(@Req() req: Request, @Res() res: Response, @CurrentUser() user: User): Promise<any> {
    if (!req.file) {
      throw new BadRequestError('Please upload an image');
    }
    const file: Express.Multer.File = req.file;
    await this.userService.updateUserProfilePicture(user, file);
    return new ApiResponse(res).withData('Profile picture updated').withStatusCode(HTTP_STATUS_CODE.OK).build();
  }
}
