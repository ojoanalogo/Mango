import nconf from './setup';
import typeORM = require('typeorm');
import path = require('path');
import redis = require('redis');


/**
 * Server name
 */
export const NAME: string = nconf.get('server:name') || 'Mango';

/**
 * Server host (e.g: localhost)
 */
export const SERVER_HOST: string = nconf.any(['host', 'server:host']) || 'localhost';

/**
 * Server port (e.g: 3000)
 */
export const SERVER_PORT: number = parseInt(nconf.any(['port', 'server:port'])) || 3000;

/**
 * API URL prefix
 */
export const API_PREFIX: string = nconf.get('server:api_prefix');

/**
 * NODE_ENV
 */
export const ENV: string = nconf.get('node_env');

/**
 * Returns if server is in production mode
 */
export const IS_PRODUCTION: boolean = ENV === 'production';

/**
 * Returns if server is in development mode
 */
export const IS_DEVELOPMENT: boolean = ENV === 'development';

/**
 * Returns if server is in staging mode
 */
export const IS_STAGING: boolean = ENV === 'staging';

/**
 * Returns if server is in testing mode
 */
export const IS_TEST: boolean = ENV === 'test';

/**
 * Returns logger level (e.g: info)
 */
export const LOG_LEVEL: string = nconf.get('logging:level');

/**
 * Returns if logging to file is enabled
 */
export const LOG_TO_FILE: boolean = nconf.get('logging:file:enabled');

/**
 * Returns logs folder
 */
export const LOG_FOLDER: string = nconf.get('logging:file:folder');

/**
 * Max size per log file
 */
export const LOG_MAX_SIZE: string = nconf.get('logging:file:size');

/**
 * How much time can a log file be stored
 */
export const LOG_DURATION: string = nconf.get('logging:file:duration');

/**
 * JWT secret
 */
export const JWT_SECRET: string = process.env.JWT_SECRET || 'mango';

/**
 * Max JWT token life before it needs to be refreshed
 */
export const JWT_TOKEN_LIFE: string = nconf.get('jwt:token_life');

/**
 * Max old age since token expired to be allowed to be refreshed
 */
export const JWT_MAX_DIFFERENCE_REFRESH: string = nconf.get('jwt:refresh_token_max_life');

/**
 *
 */
export const PASSWORD_SALT_ROUNDS: number = nconf.get('auth:salt_rounds');

/**
 * Uploads folder
 */
export const UPLOADS_FOLDER: string = nconf.get('uploads:folder');

/**
 * Profile pictures resolutions
 */
export const PROFILE_PICTURES_RESOLUTIONS: number[] = nconf.get('uploads:profile_pictures:resolutions');

/**
 * Allowed formats for profile pictures
 */
export const PROFILE_PICTURES_ALLOWED_FORMATS: string[] = nconf.get('uploads:profile_pictures:allowed_formats');

/**
 * Profile pictures folder
 */
export const PROFILE_PICTURES_FOLDER: string = nconf.get('uploads:profile_pictures:folder');

/**
 * Profile pictures max size allowed per file
 */
export const PROFILE_PICTURES_MAX_SIZE: number = nconf.get('uploads:profile_pictures:max_size');


/**
 * DB Host (e.g: localhost)
 */
export const DB_HOST: string = nconf.get('database:host');

/**
 * DB Port
 */
export const DB_PORT: number = parseInt(nconf.get('database:port'));

/**
 * DB User
 */
export const DB_USER: string = nconf.get('database:username');

/**
 * DB Password
 */
export const DB_PASSWORD: string = nconf.get('database:password');

/**
 * DB name
 */
export const DB_NAME: string = nconf.get('database:name');

/**
 * DB table prefix
 */
export const DB_PREFIX: string = nconf.get('database:prefix');

/**
 * Returns if entities should be synchronized
 */
export const DB_SYNC: boolean = nconf.get('database:synchronize');

/**
 * Returns if DB will log operations to console stream
 */
export const DB_LOGGING: boolean = nconf.get('database:logging');

/**
 * Returns if DB should cache results
 */
export const DB_CACHE: boolean = nconf.get('database:cache');

/**
 * Returns if database should retry again on startup
 */
export const DB_RETRY_CONNECTION: boolean = nconf.get('database:retry:enabled');

/**
 * Max attempts for retry
 */
export const DB_RETRY_MAX_ATTEMPTS: number = nconf.get('database:retry:attempts');

/**
 * Time between each DB connection retry attempt
 */
export const DB_RETRY_SECCONDS: number = parseInt(nconf.get('database:retry:seconds'));

/**
 * DB connection options object
 */
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
* Redis host
*/
export const REDIS_HOST: string = nconf.get('redis:host');

/**
 * Redis port
 */
export const REDIS_PORT: number = parseInt(nconf.get('redis:port'));

/**
 * Redis connection password
 */
export const REDIS_AUTH: string = nconf.get('redis:auth');

/**
 * Redis connection options
 */
export const REDIS_OPTIONS: redis.ClientOpts = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  auth_pass: REDIS_AUTH
};
