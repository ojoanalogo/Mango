import { Controller, Get, Giuseppe, Query } from "giuseppe";

@Controller('')
export class IndexController {
    @Get()
    public index() {
        return {
            "msg": "Hello world"
        }
    }
    @Get("/hello")
    public sayHello(@Query('name') name: string) : string {
        return `Hello ${name}`
    }
}