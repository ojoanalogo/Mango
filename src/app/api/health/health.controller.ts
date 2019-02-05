import { UseBefore, JsonController, Res, Get } from 'routing-controllers';
import { Response } from 'express';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';
import { HealthService } from './health.service';

@JsonController('/health')
@UseBefore(LoggingMiddleware)
export class HealthController {

  constructor(private healthService: HealthService) { }

  /**
   * GET request for Health status
   * @param response - Response object
   * @returns Health status check
   */
  @Get()
  public healthStatus(@Res() response: Response): Response {
    return new ApiResponse(response)
      .withData(this.healthService.getHealth()).withStatusCode(HTTP_STATUS_CODE.OK).build();
  }
}
