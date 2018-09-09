import { Action, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { Request } from 'express';
import { TokenRepository } from '../repositories/token.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { RoleType, getWeight } from '../entities/user/user_role.model';

/**
 * Checks if user is authorized to access route
 * @param action action object from routing controllers
 * @param roles roles array
 */
export async function authorizationChecker(action: Action, roles: RoleType[]) {
    const request: Request = action.request;
    const token = request['token'];
    if (!token) {
        throw new UnauthorizedError('Authorization required');
    }
    try {
        const userDB = await new TokenRepository().findUserByToken(token);
        const userRoleDB = await new RolesRepository().createQueryBuilder('rol')
            .leftJoin('rol.user', 'user')
            .where('rol.user = :user', { user: userDB.id }).getOne();
        const userRole = userRoleDB.role;

        if (!roles.length && userDB) {
            return true;
        }
        const rolesMatches = roles.filter((routeRole) => getWeight(userRole) >= getWeight(routeRole));
        if (rolesMatches.length >= 1) {
            return true;
        }
        throw new ForbiddenError(`Your role (${userRole}) lacks permission to use ${request.originalUrl} [${request.method}]`);
    } catch (error) {
        throw error;
    }
}
