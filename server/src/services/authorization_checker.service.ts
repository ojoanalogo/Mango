import { Action, ForbiddenError, UnauthorizedError, InternalServerError } from 'routing-controllers';
import { Service } from 'typedi';
import { Request } from 'express';
import { RolesRepository } from '../repositories/roles.repository';
import { RoleType, getWeight } from '../entities/user/user_role.model';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user/user.model';
import { Resolver } from '../handlers/resolver.handler';

@Service()
export class AuthChecker {

    constructor(private userRepository: UserRepository, private rolesRepository: RolesRepository) { }

    /**
     * Resolve account (checks if resource is valid to modification)
     * @returns Resource authorization check
     */
    private roleResolver = (user: User, action: Action, resolver: Resolver) => {
        const req: Request = action.request;
        const reqType = req.method;
        switch (resolver) {
            case Resolver.OWN_ACCOUNT:
                return user.id === parseInt(reqType === 'GET' ? req.params.id : req.body.id);
            default:
                return true;
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
    public authorizationChecker = async (action: Action, rolesParam: any) => {
        const request: Request = action.request;
        const user: User = request['user'];
        const roles = rolesParam[0].roles;
        const resolver = rolesParam[0].resolver;
        try {
            if (!roles) {
                throw new InternalServerError('No roles defined in controller action');
            }
            const userDB = await this.userRepository.findOne({ id: user.id });
            if (!userDB) {
                throw new ForbiddenError('Your user not longer exists in the database');
            }
            const userRoleDB = await this.rolesRepository.createQueryBuilder('rol')
                .leftJoin('rol.user', 'user')
                .where('rol.user = :user', { user: userDB.id }).getOne();
            const userRole = userRoleDB.role;
            if (!roles.length && userRoleDB) {
                return true;
            }
            const rolesMatches = roles.filter((routeRole) => getWeight(userRole) >= getWeight(routeRole));
            const rolesResolver = getWeight(userRole) >= getWeight(RoleType.DEVELOPER) ?
                true : this.roleResolver(userDB, action, resolver);
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
}
