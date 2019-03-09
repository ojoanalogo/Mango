import { Response } from 'express';
import { Get, JsonController, Res, UseBefore } from 'routing-controllers';
import { ApiResponse, HTTP_STATUS_CODE } from '../../handlers/api_response.handler';
import { LoggingMiddleware } from '../../middleware/http_logging.middleware';

@JsonController()
@UseBefore(LoggingMiddleware)
export class IndexController {

  /**
   * GET request for Hello API
   * @param response - Response object
   */
  @Get()
  public index(@Res() response: Response): Response {
    return new ApiResponse(response)
      .withData('Welcome to our API endpoint').withStatusCode(HTTP_STATUS_CODE.OK).build();
  }
}
