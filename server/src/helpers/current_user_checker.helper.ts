import { Service } from 'typedi';
import { Action, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TokenRepository } from '../api/auth/token.repository';

@Service()
export class CurrenUserChecker {

   constructor(
      @InjectRepository()
      private tokenRepository: TokenRepository) { }

   /**
   * Returns user from token
   * @param action - Action object from routing controllers
   * @returns User object
   */
   public getCurrentUserFromToken = async (action: Action) => {
      const request: Request = action.request;
      let token: string = request.headers['authorization'].split(' ')[1];
      if (token == null) {
         throw new UnauthorizedError('Authorization required');
      }
      // if token was refreshed let's use the new token instead of the original one in the header request
      if (request['token']) {
         token = request['token'];
      }
      const tokenDataWithUser = await this.tokenRepository.getTokenWithUser(token);
      if (!tokenDataWithUser) {
         throw new ForbiddenError('Cannot find user associated to token');
      }
      return tokenDataWithUser.user;
   }
}
