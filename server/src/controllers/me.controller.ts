import {
    Body, Get, Res, UseBefore,
    JsonController, NotFoundError,
    BadRequestError, Authorized, Req, UploadedFile, Put
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

@JsonController('/me')
@UseBefore(LoggingMiddleware)
export class MeController {
    constructor(private userService: UserService, private tokenRepository: TokenRepository) { }
    /**
     * GET request to get user profile info, needs JWT token
     * @param response response Object
     * @param request request Object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    @Authorized([RoleType.USER])
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
     * PUT request to update user profile picture
     * @param response response Object
     * @param request request Object
     * @param user user Object from body
     * @param profilePicture multipart file
     */
    @Put('/profile_picture')
    @UseBefore(JWTMiddleware)
    @Authorized([RoleType.USER])
    public async updateProfilePicture(@Body({ required: true }) user: User,
        @UploadedFile('profile_picture',
            { options: UploadUtils.getProfileUploadMulterOptions() }) profilePicture: any): Promise<Response> {
        if (!profilePicture) {
            throw new BadRequestError('Please upload an image');
        }
        const userDB = await this.userService.getUserByEmail(user.email);
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        this.userService.updateUserProfilePicture(user, profilePicture);
        return profilePicture;
    }
}
