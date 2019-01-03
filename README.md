<h1 align="center">
  <br>
  <img src="docs/mango.png" alt="mango" width="120">
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
MySQL is also needed (or change the database driver in database.ts file, check [TypeORM](https://github.com/typeorm/typeorm) documentation for a how-to)

```bash
# Clone this repository
$ git clone https://github.com/MrARC/Mango

# Go into the repository
$ cd Mango/server

# Install dependencies
$ npm install

# Create .env file
$ cp .example.env .env

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

## 💥 How to add a new module (controller, service and repo)

Adding a new module it's easy with [plop](https://github.com/amwmedia/plop), just open your console shell, execute:

```bash
npm add:module
```

and follow the steps ✅

![module](docs/plop.gif)

## 🔐 Adding authorization or role protection to routes

Adding authorization to a route it's easy, just use the @Authorized annotation and add a roles property (can be an array of roles or a single role (or null if you only want to verify if there's a valid JWT token in request), but there's a weight system in place so users with high role can use routes that are for lower roles)

```typescript
    @Post()
    // use only @Authorized() if you want to verify only jwt token
    @Authorized(RoleType.USER)
    public async blabla(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
      ...
    }
```

## ✅ JWT refresh in Mango

I made a sequence diagram to try to explain this process:

![diagram](docs/token_sequence.png)

### 🤔 Explanation

Basically there's only one JWT token you will store in the client (web, mobile app, whatever), this JWT token is short-lived (it has a life span of only a few minutes, 15 minutes in production mode), all requests made in that span of time will be passed if the JWT is valid.
If the JWT token is expired, Mango will check if is not older than 1 week and will try to update the old token in database and issue a new JWT token with the new parameters, otherwise it will throw a ForbiddenError  with a 403 status code. The new JWT token will be present in the server response inside a custom header parameter (X-Auth-Token), this parameter will hold your new JWT token for the new requests.

### 📝 Note

You will have to implement some logic on your frontend or mobile app to replace the stored JWT token if the header X-Auth-Token is present in the server response, Mango will refuse to update any already updated JWT token and will throw a UnauthorizedError with a 401 status code.

## 📂 Structure

```text
.
├── docs
│   ├── mango.png
│   └── plop.gif
├── LICENSE
├── README.md
└── server
    ├── ecosystem.config.js
    ├── .editorconfig
    ├── .example.env
    ├── nodemon.json
    ├── package.json
    ├── package-lock.json
    ├── plopfile.js
    ├── plop-templates
    │   ├── controller.hbs
    │   ├── repository.hbs
    │   └── service.hbs
    ├── public
    │   └── index.html
    ├── src
    │   ├── api
    │   │   ├── auth
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── jwt.service.ts
    │   │   │   ├── token.model.ts
    │   │   │   └── token.repository.ts
    │   │   ├── common
    │   │   │   ├── CUD.ts
    │   │   │   └── CUID.ts
    │   │   ├── health
    │   │   │   ├── health.controller.ts
    │   │   │   └── health.service.ts
    │   │   ├── index
    │   │   │   └── index.controller.ts
    │   │   ├── me
    │   │   │   └── me.controller.ts
    │   │   └── users
    │   │       ├── user.model.ts
    │   │       ├── user_profile_picture.model.ts
    │   │       ├── user.repository.ts
    │   │       ├── user_role.model.ts
    │   │       ├── users.controller.ts
    │   │       └── user.service.ts
    │   ├── app.ts
    │   ├── database
    │   │   ├── database.ts
    │   │   └── redis.ts
    │   ├── handlers
    │   │   ├── api_error.handler.ts
    │   │   └── api_response.handler.ts
    │   ├── helpers
    │   │   ├── authorization_checker.helper.ts
    │   │   └── current_user_checker.helper.ts
    │   ├── logger
    │   │   └── logger.service.ts
    │   ├── middleware
    │   │   ├── error.middleware.ts
    │   │   ├── http_logging.middleware.ts
    │   │   └── not_found.middleware.ts
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

* [x] Add JWT token refresh
* [x] Better authorization token flow
* [x] Better project structure
* [x] Better readme
* [ ] Create a config file
* [ ] Add docker support
* [ ] Add GraphQL?
* [ ] Add unit test and integration tests (help wanted)

## ✍ Changelog

* 0.1 - First release
* 0.1.1 - Refactored authorization function, moved JWT middleware to auth function
* 0.1.2 - Refactored logging system, now it supports context for file, changed the way repositories are created (uses typedi injection), added current user checker, added some validation to me controller, tokens are now deleted when user changes his password or email. Refactored profile upload methods.
* 0.1.3 - Better project structure
* 0.1.4 - Better project structure again, removed graphics magick dependence and replaced it with sharp
* 0.1.5 - Fixed bug with refresh token flow, user would have to make request again to be found by user controller, improved logging
* 0.1.6 - Decoupled database from main server start, fixed load order error with repository injectors in routing-controllers helpers, indented with 2 spaces instead of 4, improved logging, fixed user profile update method

## 🤗 Credits

<div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
