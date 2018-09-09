import { Action, NotAcceptableError, UnauthorizedError } from 'routing-controllers';
import { Request } from 'express';

export async function authorizationChecker(action: Action, roles: string[]) {
    const request: Request = action.request;
    return false;
}
