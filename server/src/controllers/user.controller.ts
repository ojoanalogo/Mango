import {Controller, Param, Body, Get, Post, Put, Delete, UseBefore, JsonController, Req, Res } from 'routing-controllers';
import morgan = require('morgan');
import { UserService } from '../services/user.service';

@JsonController('/v1/users')
@UseBefore(morgan('dev'))
export class UserController {

    @Get('/')
    index(@Req() req: any, @Res() res: Response) {
        return new UserService().getUsers();
    }

    @Post()
    addUser() {

    }

    @Get(':id')
    getUser(@Param('id') id: number) {

    }

    @Put(':id')
    updateUser(@Body() data: any) {

    }
    @Delete(':id')
    deleteUser(@Param('id') id: number) {

    }

}
