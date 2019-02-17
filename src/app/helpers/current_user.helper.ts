import { Service } from 'typedi';
import { Action, UnauthorizedError, ForbiddenError, NotFoundError } from 'routing-controllers';
import { getCustomRepository } from 'typeorm';
import { Logger } from '../decorators';
import { User } from '../api/users/user.entity';
import { TokenRepository } from '../api/auth/token.repository';
import { ServerLogger } from '../lib/logger';

@Service()
export class CurrentUserHelper {

  constructor(
    @Logger(__filename) private readonly logger: ServerLogger) { }

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
      throw new NotFoundError('Can not find user associated with token');
    }
    return tokenDataWithUser.user;
  }
}
