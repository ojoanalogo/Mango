import { Get, UseBefore, JsonController, Res, Authorized, Post } from 'routing-controllers';
import { Response } from 'express';
import { LoggingMiddleware } from '../middleware/http_logging.middleware';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/api_response.handler';
import { HealthService } from '../services/health.service';
import { JWTMiddleware } from '../middleware/jwt.middleware';
import { RoleType } from '../entities/user/user_role.model';
import { Resolver } from '../handlers/resolver.handler';

@JsonController('/health')
@UseBefore(LoggingMiddleware)
export class HealthController {

    constructor(private healthService: HealthService) { }
    /**
     * GET request for Health status
     * @param response response object
     */
    @Get()
    @UseBefore(JWTMiddleware)
    @Authorized({
        roles: [RoleType.USER],
        resolver: Resolver.OWN_ACCOUNT
    })
    public healthStatus(@Res() response: Response): Response {
        return new ApiResponse(response)
            .withData(this.healthService.getHealth()).withStatusCode(HTTP_STATUS_CODE.OK).build();
    }

    @Post()
    @UseBefore(JWTMiddleware)
    @Authorized({
        roles: [RoleType.USER],
        resolver: Resolver.OWN_ACCOUNT
    })
    public healtehStatus(@Res() response: Response): Response {
        return new ApiResponse(response)
            .withData(this.healthService.getHealth()).withStatusCode(HTTP_STATUS_CODE.OK).build();
    }
}
