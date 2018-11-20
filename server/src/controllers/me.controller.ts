import {
    Body, Get, Res, UseBefore,
    JsonController, NotFoundError,
    BadRequestError, Authorized, Req, Put
} from 'routing-controllers';
import { Response, Request } from 'express';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { UserService } from '../services/user.service';
import { LoggingMiddleware } from '../middleware/http_logging.middleware';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { User } from '../entities/user/user.model';
import { RoleType } from '../entities/user/user_role.model';
import { TokenRepository } from '../repositories/token.repository';
import { UploadUtils } from '../utils/upload.utils';
import { Resolver } from '../handlers/resolver.handler';
import * as multer from 'multer';

@JsonController('/me')
@UseBefore(LoggingMiddleware)
export class MeController {

    constructor(private userService: UserService, private tokenRepository: TokenRepository) { }

    /**
     * GET request to get user profile info
     * @param response - Response object
     * @param request - Request object
     * @returns User profile
     */
    @Get()
    @UseBefore(JWTMiddleware)
    @Authorized({
        roles: [RoleType.USER]
    })
    public async getProfile(@Req() request: Request, @Res() response: Response): Promise<Response> {
        const tokenData = await this.tokenRepository.getTokenWithUser(request['token']);
        if (!tokenData) {
            throw new NotFoundError('Cannot find user associated to token');
        }
        const userProfile = await this.userService.getUserByEmail(tokenData.user.email);
        return new ApiResponse(response)
            .withData(userProfile)
            .withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    /**
     * PUT request to update user profile info
     * @param response - Response object
     * @param request - Request object
     * @param user - User object from body
     * @returns Update profile result
     */
    @Put()
    @UseBefore(JWTMiddleware)
    @Authorized({
        roles: [RoleType.USER],
        resolver: Resolver.OWN_ACCOUNT
    })
    public async updateProfileByID(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
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

    /**
     * PUT request to update user profile picture
     * @param response - Response object
     * @param request - Request object
     * @param user - User object from body
     * @param profilePicture - Multipart file
     * @returns Update profile picture result
     */
    @Put('/profile_picture')
    @UseBefore(JWTMiddleware, multer(UploadUtils.getProfileUploadMulterOptions()).any())
    @Authorized({
        roles: [RoleType.USER],
        resolver: Resolver.OWN_ACCOUNT
    })
    public async updateProfilePicture(@Req() req: Request, @Res() res: Response, @Body() user: User): Promise<any> {
        const file: Express.Multer.File = req.files[0];
        if (!file) {
            throw new BadRequestError('Please upload an image');
        }
        const userDB = await this.userService.getUserByID(user.id);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        await this.userService.updateUserProfilePicture(user, file);
        return new ApiResponse(res).withData('Profile picture updated').withStatusCode(HTTP_STATUS_CODE.OK).build();
    }
}
