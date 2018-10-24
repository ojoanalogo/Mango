import { Action, ForbiddenError, NotFoundError, UnauthorizedError } from 'routing-controllers';
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
     * fuck this m8 just mock everything
     */
    public roleResolver = (user: User, action: Action, resolver: Resolver) => {
        const req: Request = action.request;
        switch (resolver) {
            case Resolver.OWN_ACCOUNT:
                return user.id === parseInt(req.body.id);
            default:
                return true;
        }
    }
    /**
    * Checks if user is authorized to access route
    * @param action action object from routing controllers
    * @param roles roles array
    */
    // TODO: Refactor this function
    public authorizationChecker = async (action: Action, rolesParam: any) => {
        const request: Request = action.request;
        const user = request['user'];
        const roles = rolesParam[0].roles;
        const resolver = rolesParam[0].resolver;
        try {
            const userDB = await this.userRepository.findOne({ id: user.id });
            if (!userDB) {
                throw new NotFoundError('User not found');
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
                throw new UnauthorizedError(`You don't have
                authorization to modify this resource (${request.originalUrl} [${request.method}])`);
            }
            throw new ForbiddenError(`Your role (${userRole}) lacks permission to use ${request.originalUrl} [${request.method}]`);
        } catch (error) {
            throw error;
        }
    }
}
