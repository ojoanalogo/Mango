<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/4296205/48927424-010c8100-ee93-11e8-8ef5-257ca62035c6.png" alt="mango" width="120">
  <br>
  Mango
  <h4 align="center">TypeScript server template with routing-controllers, typeorm and typedi</h4>
</h1>


<p align="center">  
<img src="https://travis-ci.com/MrARC/Mango.svg?token=dsjyRm5j3xVPphZTyCrG&branch=master">
 <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>
 
<p align="center">
⚡ Mango is a server template which makes it easy to build backend powered by NodeJS, Express, typeorm, typedi and routing-controllers. It minimises the setup time and makes your development cycle faster by using TypeScript.
  If you were looking for a server template with useful things, Mango is for you 🤗
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-how-to-use">How to use</a> •
   <a href="#-structure">Structure</a> •
     <a href="#-changelog">Changelog</a> •
  <a href="#-credits">Credits</a>
</p>

## ⚡ Features

* TypeScript
  - [TypeScript](https://www.typescriptlang.org/) compiles to clean, simple JavaScript code which runs on any browser, in Node.js, or in any JavaScript engine that supports ECMAScript 3 (or newer).
* [TypeORM](https://github.com/typeorm/typeorm)
  - Mango uses TypeORM to map models to your database manager, everything is typed and easier to mantain.
* [TypeDI](https://github.com/typestack/typedi)
  - Mango uses Typedi for dependencies injection
* [routing-controllers](https://github.com/typestack/routing-controllers/)
  - Every controller has it's own file, you declare your routes with annotations and they get registered on server start.
* JWT middleware (there's a refresh token flow, no need to use 2 tokens!)
* Resource activation protection, if a user doesn't own a resource he won't be able to modify it
* Logging, uses [winston](https://github.com/winstonjs/winston), everything gets logged to a file.
* User CRUD and also profile picture upload with [multer](https://github.com/expressjs/multer)
* dotEnv variables
* pm2 ready

 And many other features
  
## ❓ How to use

To clone and run this server template, you'll need [Git](https://git-scm.com) and [NodeJS](https://nodejs.org/es/)

```bash
# Clone this repository
$ git clone https://github.com/MrARC/Mango

# Go into the repository
$ cd Mango/server

# Install dependencies
$ npm install

# Run the server
$ npm run dev

```

## 👨‍💻 Creating an API response
You may want to use a standard response for all your API calls, you can import the ApiResponse object from ```handlers/api_response.handler``` and create a new instance of it

example:

```typescript

const response = new ApiResponse(response)
            .withData({msg: 'hello'}).withStatusCode(HTTP_STATUS_CODE.OK).build();
```
A request can have the following properties

Method | Description | Note
--- | --- | ---
`.withData(object)` | Anything you want |
`.withStatusCode(HTTP_STATUS_CODE)` | HTTP Status code (see HTTP_STATUS_CODE class) | Defaults to 200
`.build()` | Finish building request | Required to finish building request

## 💥 How to add a new controller

Adding a new controller it's easy with plop (https://github.com/amwmedia/plop), just open your console shell, execute:
```
npm add:controller
```
and follow the steps ✅

![controller](https://user-images.githubusercontent.com/4296205/48928943-2acca480-eea1-11e8-8b60-42d30cbf4ffb.gif)

## 🔐 Adding authorization or role protection to routes

Adding authorization to a route it's easy, just use the @Authorized annotation and add a roles property (can be an array of roles (or null if you only want to verify if there's a JWT token in request), but there's a weight system in place so users with high role can use routes that are for lower roles)

```typescript
    @Post()
    @Authorized({
        roles: [RoleType.USER],
        resolver: Resolver.OWN_ACCOUNT
    })
    public async blabla(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
```

## 📂 Structure

```
.
├── LICENSE
├── README.md
└── server
    ├── ecosystem.config.js
    ├── nodemon.json
    ├── package.json
    ├── package-lock.json
    ├── plopfile.js
    ├── plop-templates
    │   ├── controller.hbs
    │   └── service.hbs
    ├── public
    │   └── index.html
    ├── src
    │   ├── app.ts
    │   ├── controllers
    │   │   ├── auth.controller.ts
    │   │   ├── health.controller.ts
    │   │   ├── index.controller.ts
    │   │   ├── me.controller.ts
    │   │   └── user.controller.ts
    │   ├── database
    │   │   ├── database.ts
    │   │   └── redis.ts
    │   ├── entities
    │   │   ├── CUD.ts
    │   │   ├── CUID.ts
    │   │   ├── token
    │   │   │   └── token.model.ts
    │   │   └── user
    │   │       ├── user.model.ts
    │   │       ├── user_profile_picture.model.ts
    │   │       └── user_role.model.ts
    │   ├── handlers
    │   │   ├── api_error.handler.ts
    │   │   ├── api_response.handler.ts
    │   │   └── resolver.handler.ts
    │   ├── middleware
    │   │   ├── error.middleware.ts
    │   │   ├── http_logging.middleware.ts
    │   │   └── not_found.middleware.ts
    │   ├── repositories
    │   │   ├── token.repository.ts
    │   │   └── user.repository.ts
    │   ├── services
    │   │   ├── authorization_checker.service.ts
    │   │   ├── health.service.ts
    │   │   ├── jwt.service.ts
    │   │   ├── logger.service.ts
    │   │   └── user.service.ts
    │   ├── utils
    │   │   ├── json.utils.ts
    │   │   └── upload.utils.ts
    │   └── www.ts
    ├── tests
    │   ├── src
    │   │   ├── controllers
    │   │   │   └── index.controller.spec.ts
    │   │   └── setup.ts
    │   └── tsconfig.json
    ├── tsconfig.json
    └── tslint.json
```

## 📋 ToDo

- [x] Add JWT token refresh
- [x] Better authorization token flow
- [ ] Better readme
- [ ] Add docker support
- [ ] Add GraphQL?
- [ ] Add unit test and integration tests (help wanted)

## ✍ Changelog

- 0.1 - First release
- 0.1.1 - Refactored authorization function, moved JWT middleware to auth function
- 0.1.2 - Refactored logging system, now it supports context for file, changed the way repositories are created (uses typedi injection), added current user checker, added some validation to me controller, tokens are now deleted when user changes his password or email. Refactored profile upload methods.

## 🤗 Credits

<div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
