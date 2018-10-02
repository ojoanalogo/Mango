import { Action, ForbiddenError, NotFoundError } from 'routing-controllers';
import { Request } from 'express';
import { RolesRepository } from '../repositories/roles.repository';
import { RoleType, getWeight } from '../entities/user/user_role.model';
import { UserRepository } from '../repositories/user.repository';

/**
 * Checks if user is authorized to access route
 * @param action action object from routing controllers
 * @param roles roles array
 */
export async function authorizationChecker(action: Action, roles: RoleType[]) {
    const request: Request = action.request;
    const user = request['user'];
    try {
        const userDB = await new UserRepository().findOne({ id: user.id });
        if (!userDB) {
            throw new NotFoundError('User not found');
        }
        const userRoleDB = await new RolesRepository().createQueryBuilder('rol')
            .leftJoin('rol.user', 'user')
            .where('rol.user = :user', { user: userDB.id }).getOne();
        const userRole = userRoleDB.role;
        if (!roles.length && userRoleDB) {
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
