import { Service } from 'typedi';
import { Action, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { LoggerService, Logger } from '../logger/logger.service';
import { TokenRepository } from '../api/auth/token.repository';
import { getCustomRepository } from 'typeorm';
import { User } from '../api/users/user.model';

@Service()
export class CurrenUserChecker {

  constructor(
    @Logger(__filename) private logger: LoggerService) { }

  /**
  * Returns user from token
  * @param action - Action object from routing controllers
  * @returns User object
  */
  public getCurrentUserFromToken = async (action: Action): Promise<User> => {
    const request: Request = action.request;
    let token: string = request.headers['authorization'].split(' ')[1];
    if (token == null) {
      throw new UnauthorizedError('Authorization required');
    }
    // if token was refreshed let's use the new token instead of the original one in the header request
    if (request['token']) {
      token = request['token'];
    }
    // get custom repo
    const tokenRepository = getCustomRepository(TokenRepository);
    // get token object with user data
    const tokenDataWithUser = await tokenRepository.getTokenWithUser(token);
    if (!tokenDataWithUser) {
      throw new ForbiddenError('Can not find user associated with token');
    }
    return tokenDataWithUser.user;
  }
}
