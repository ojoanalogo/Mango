import { Controller, Param, Get, UseBefore } from 'routing-controllers';
import morgan = require('morgan');

@Controller()
@UseBefore(morgan('dev'))
export class IndexController {

    @Get('')
    public index() {
        return {
            'msgs': 'Hello Stranger'
        };
    }
    @Get('/hello/:name')
    public sayHello(@Param('name') name: string = 'aaa'): string {
        return 'Hello, your rwerwr name was: ' + name;
    }
}
