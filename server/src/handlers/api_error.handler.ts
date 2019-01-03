import { ApiResponse } from './api_response.handler';

export class ApiError extends ApiResponse {
  private error: any;
  private stack: any;

  /**
   * Adds error field
   * @param error - Error name
   */
  public withErrorName(error: string) {
    this.error = error;
    return this;
  }
  /**
   * If needed, add stacktrace to the response
   * @param stack - Stacktrace
   */
  public withStackTrace(stack: any) {
    this.stack = stack;
    return this;
  }
}
