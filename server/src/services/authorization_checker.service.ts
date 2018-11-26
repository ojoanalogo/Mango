import { Action, ForbiddenError, UnauthorizedError, NotAcceptableError } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response } from 'express';
import { RolesRepository } from '../repositories/roles.repository';
import { RoleType, getWeight } from '../entities/user/user_role.model';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user/user.model';
import { Resolver } from '../handlers/resolver.handler';
import { JWTService } from './jwt.service';
import { Logger, LoggerService } from './logger.service';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

@Service()
export class AuthChecker {

    constructor(
        @Logger() private logger: LoggerService,
        private userRepository: UserRepository,
        private rolesRepository: RolesRepository,
        private jwtService: JWTService) { }

    /**
     * Try to refresh JWT token
     * @param token - JWT Token
     * @param request - Request object
     * @param response - Response object
     */
    private tryRefreshToken = async (token: string, request: Request, response: Response): Promise<void> => {
        const decoded = await this.jwtService.decodeToken(token);
        const exp = moment(decoded.exp * 1000);
        const dif = exp.diff(new Date(), 'days');
        if (dif >= -7) {
            const user: User = decoded['user'];
            if (!user) {
                throw new NotAcceptableError('Invalid Token data');
            }
            this.logger.getLogger().info('Refreshing token for user ID (' + user.id + ')');
            const newToken = await this.jwtService.refreshToken(token);
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
                const jwtTokenDecoded = await this.jwtService.verifyToken(token);
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
                    throw new NotAcceptableError('Invalid Token');
                } else {
                    throw error;
                }
            }
        } else {
            // bad code format, should not happen
            throw new NotAcceptableError('Invalid Token');
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
    public authorizationChecker = async (action: Action, rolesParam?: any): Promise<boolean> => {
        const request: Request = action.request;
        const response: Response = action.response;
        const roles: RoleType[] = rolesParam[0] ? rolesParam[0].roles : [RoleType.USER];
        const resolver: Resolver = rolesParam[0] ? rolesParam[0].resolver : Resolver.OWN_ACCOUNT;
        // first we verify the JWT token
        await this.checkToken(request, response);
        // user param should now be available
        const user: User = request['user'];
        if (!roles) {
            action.next();
        }
        try {
            // check if user exists in database
            const userExists = await this.userRepository.count({ id: user.id });
            if (!userExists) {
                throw new ForbiddenError('Your user not longer exists in the database');
            }
            const userRoleDB = await this.rolesRepository.createQueryBuilder('rol')
                .leftJoin('rol.user', 'user')
                .where('rol.user = :user', { user: user.id }).getOne();
            const userRole = userRoleDB.role;
            if (!roles.length && userRoleDB) {
                return true;
            }
            // filter and check if user has a role with enought weight to use controller
            const rolesMatches = roles.filter((routeRole) => getWeight(userRole) >= getWeight(routeRole));
            const rolesResolver = getWeight(userRole) >= getWeight(RoleType.DEVELOPER) ?
                true : this.roleResolver(user, action, resolver);
            if (rolesMatches.length >= 1 && userRoleDB && rolesResolver) {
                return true;
            }
            if (!rolesResolver) {
                throw new UnauthorizedError(
                    `You don't have authorization to modify this resource (${request.originalUrl} [${request.method}])`);
            }
            throw new ForbiddenError(`Your role (${userRole}) lacks permission to use ${request.originalUrl} [${request.method}]`);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Resolve account (checks if resource is valid to modification)
     * @returns Resource authorization check
     */
    private roleResolver = (user: User, action: Action, resolver: Resolver): boolean => {
        const req: Request = action.request;
        const reqType = req.method;
        switch (resolver) {
            case Resolver.OWN_ACCOUNT:
                return user.id === parseInt(reqType === 'GET' ? req.params.id : req.body.id);
            default:
                return true;
        }
    }
}
