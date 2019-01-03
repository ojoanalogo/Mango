import { Action, ForbiddenError, UnauthorizedError, NotAcceptableError } from 'routing-controllers';
import { getCustomRepository, getRepository } from 'typeorm';
import { Container, Service } from 'typedi';
import { Request, Response } from 'express';
import { Logger, LoggerService } from '../logger/logger.service';
import { JWTService } from '../api/auth/jwt.service';
import { RoleType, getWeight, Role } from '../api/users/user_role.model';
import { User } from '../api/users/user.model';
import { UserRepository } from '../api/users/user.repository';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

@Service()
export class AuthChecker {

  constructor(
    @Logger(__filename) private logger: LoggerService) { }

  /**
   * Try to refresh JWT token
   * @param token - JWT Token
   * @param request - Request object
   * @param response - Response object
   */
  private tryRefreshToken = async (token: string, request: Request, response: Response): Promise<void> => {
    const jwtService = Container.get(JWTService);
    const decoded = await jwtService.decodeToken(token);
    const exp = moment(decoded.exp * 1000);
    const dif = exp.diff(new Date(), 'days');
    if (dif >= -7) {
      const user: User = decoded['user'];
      if (!user) {
        throw new NotAcceptableError('Invalid Token data');
      }
      const newToken = await jwtService.refreshToken(token);
      // send the new shiny token
      response.setHeader('X-Auth-Token', newToken);
      // bind token and user id to request object
      request['token'] = newToken;
      request['user'] = user;
    } else {
      throw new ForbiddenError('Token expired');
    }
  }

  /**
   * Check JWT Token, here we check if request has a valid JWT token and we renew it if is still valid
   * @param request - Request object
   * @param response - Response object
   */
  private checkToken = async (request: Request, response: Response): Promise<void> => {
    // get auth header from request
    const authorizationHeader = request.get('authorization');
    if (authorizationHeader == null) {
      throw new UnauthorizedError('Authorization required');
    }
    // an AUTH header looks like 'SCHEMA XXXXXXXXXXXX, so we should split it'
    const tokenParts = authorizationHeader.split(' ');
    // validate length of the array with token
    if (tokenParts.length < 1) {
      throw new NotAcceptableError('Invalid Token structure');
    }
    const schema = tokenParts[0]; // should be "Bearer"
    const token = tokenParts[1];
    // bind token to request object
    request['token'] = token;
    // test Regex for valid JWT token
    if (/[A-Za-z0-9\-\._~\+\/]+=*/.test(token) && /[Bb]earer/.test(schema)) {
      try {
        const jwtService = Container.get(JWTService);
        const jwtTokenDecoded = await jwtService.verifyToken(token);
        // now we check if the decoded token belongs to the user
        const user = jwtTokenDecoded['user'];
        if (!user) {
          throw new NotAcceptableError('Invalid Token data');
        }
        // bind user to request object
        request['user'] = user;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          // Refresh token logic
          await this.tryRefreshToken(token, request, response);
        } else if (error instanceof jwt.JsonWebTokenError) {
          throw new NotAcceptableError('Invalid Token, ' + error.message);
        } else {
          throw new NotAcceptableError('Invalid Token');
        }
      }
    } else {
      // bad code format, should not happen
      throw new NotAcceptableError('Invalid Token format, use Authorization: Bearer XXXXXXXXXX');
    }
  }

  /**
  * Checks if user is authorized to access route
  *
  * TODO: Refactor this function
  *
  * @param action - Action object from routing controllers
  * @param roles - Roles array
  * @returns Authorization result
  */
  public authorizationChecker = async (action: Action, rolesParam?: RoleType[]): Promise<boolean> => {
    const request: Request = action.request;
    const response: Response = action.response;
    const roles: RoleType[] = rolesParam ? rolesParam : [RoleType.USER];
    // first we verify the JWT token
    await this.checkToken(request, response);
    // user param should now be available
    const user: User = request['user'];
    // check if user exists in database
    const userRepository = getCustomRepository(UserRepository);
    const userExists = await userRepository.count({ id: user.id });
    if (!userExists) {
      throw new ForbiddenError('Your user not longer exists in the database');
    }
    const roleRepository = getRepository(Role);
    const userRoleDB = await roleRepository.createQueryBuilder('rol')
      .leftJoin('rol.user', 'user')
      .where('rol.user = :user', { user: user.id }).getOne();
    const userRole = userRoleDB.role;
    if (!roles.length && userRoleDB) {
      return true;
    }
    // filter and check if user has a role with enought weight to use controller
    const rolesMatches = roles.filter((routeRole) => getWeight(userRole) >= getWeight(routeRole));
    if (rolesMatches.length >= 1 && userRoleDB) {
      return true;
    }
    throw new ForbiddenError(`Your role (${userRole}) lacks permission to use ${request.originalUrl} [${request.method}]`);
  }
}
