import {Controller, Param, Body, Get, Post, Put, Delete, Res, Req, UseBefore, JsonController,
     Interceptor, InterceptorInterface } from 'routing-controllers';
import morgan = require('morgan');
import {Response} from 'express';
import { UserService } from '../services/user.service';


@JsonController('/v1/user/')
@UseBefore(morgan('dev'))
export class UserController {

    @Get()
    public async getUsers(@Req() request: any, @Res() response: Response) {
        const data = await UserService.getUsers(100);
        data ? response.statusCode = 200 : response.statusCode = 500;
        return response.json({
            'code': 1,
            'payload': data
        });
    }

    @Get(':name')
    public async getUser(@Req() request: any, @Res() response: Response, @Param('name') email: string, @Res() res: Response) {
        const data = await UserService.getUserByEmail(email);
        data ? response.statusCode = 200 : response.statusCode = 500;
        return response.json({
            'code': 1,
            'payload': data
        });
    }

}
