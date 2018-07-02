import {Controller, Param, Body, Get, Post, Put, Delete, UseBefore } from 'routing-controllers';
import morgan = require('morgan');
import { User, UserModel } from '../models/user.model';

@Controller('/user')
@UseBefore(morgan('dev'))
export class UserController {

    @Get('/')
    public async index() {
        const rs = await new UserModel().getUsers();
        return {
            'msg': rs
        };
    }

    @Get('/new/:name')
    public async newUser(@Param('name') name: string) {
        const rs = await new UserModel().createUser();
        if (rs) {
            return {
                'msg': 'User created!'
            };
        } else {
            return {
                'msg': 'Error creating user'
            };
        }
    }
}
