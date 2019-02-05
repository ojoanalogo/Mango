import nconf from './setup';
import * as typeORM from 'typeorm';
import * as path from 'path';
import * as redis from 'redis';

/**
* Server settings
*/
export const SERVER_HOST: string = nconf.get('server:host') || 'localhost';
export const SERVER_PORT: number = parseInt(nconf.any(['server:port', 'port'])) || 3000;

/**
* Environemnt
*/
export const ENV: string = nconf.get('node_env') || 'development';
export const IS_PRODUCTION: boolean = ENV === 'production';
export const IS_DEVELOPMENT: boolean = ENV === 'development';
export const IS_STAGING: boolean = ENV === 'staging';
export const IS_TEST: boolean = ENV === 'test';

/**
* Logger settings
*/
export const LOG_TO_FILE: boolean = nconf.get('logging:file:enabled');

/**
* JWT config
*/
export const JWT_SECRET: string = process.env.JWT_SECRET || 'fallbackSecret';
export const JWT_TOKEN_LIFE: string = nconf.get('jwt:life');
export const JWT_MAX_DIFFERENCE_REFRESH: string = nconf.get('jwt:maxlife');

/**
* Database settings
*/
export const DB_HOST: string = nconf.get('database:host');
export const DB_PORT: number = parseInt(nconf.get('database:port'));
export const DB_USER: string = nconf.get('database:username');
export const DB_PASSWORD: string = nconf.get('database:password');
export const DB_NAME: string = nconf.get('database:name');
export const DB_PREFIX: string = nconf.get('database:prefix');
export const DB_SYNC: boolean = nconf.get('database:synchronize');
export const DB_LOGGING: boolean = nconf.get('database:logging');
export const DB_CACHE: boolean = nconf.get('database:cache');
export const DB_RETRY_CONNECTION: boolean = nconf.get('database:retry:enabled');
export const DB_RETRY_MAX_ATTEMPTS: number = nconf.get('database:retry:attempts');
export const DB_RETRY_SECCONDS: number = parseInt(nconf.get('database:retry:seconds'));
// DB options object
export const DB_OPTIONS: typeORM.ConnectionOptions = {
  type: 'mariadb',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entityPrefix: DB_PREFIX,
  entities: [path.join(__dirname, '../app/api/**/*.entity{.js,.ts}')],
  migrations: [path.join(__dirname, '../app/database/migrations/**/*{.js,.ts}')],
  synchronize: DB_SYNC,
  logging: DB_LOGGING,
  cache: DB_CACHE
};

/**
* Redis connection settings
*/
export const REDIS_HOST: string = nconf.get('redis:host');
export const REDIS_PORT: number = parseInt(nconf.get('redis:port'));
export const REDIS_AUTH: string = nconf.get('redis:auth');
export const REDIS_CLIENT: redis.ClientOpts = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  auth_pass: REDIS_AUTH
};
