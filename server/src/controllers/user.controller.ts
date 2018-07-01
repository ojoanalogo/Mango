import {Controller, Param, Body, Get, Post, Put, Delete, UseBefore } from 'routing-controllers';
import morgan = require('morgan');
import { User, IUser } from '../models/user.model';

@Controller('/user')
@UseBefore(morgan('dev'))
export class UserController {

    @Get('/')
    public index() {
        return {
            'msg': 'helo'
        };
    }

    @Get('/new/:name')
    public async newUser(@Param('name') name: string) {
        const rs = await new User().createUser(new IUser('Alfonso', 'Reyes', 'arc980103@gmail.com'));
    }
}
