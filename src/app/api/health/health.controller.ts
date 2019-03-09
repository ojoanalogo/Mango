import { Response } from 'express';
import { Get, JsonController, Res, UseBefore } from 'routing-controllers';
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
    const serviceHealth = this.healthService.getHealth();
    return new ApiResponse(response)
      .withData(serviceHealth).withStatusCode(HTTP_STATUS_CODE.OK).build();
  }
}
