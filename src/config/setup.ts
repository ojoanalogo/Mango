/**
* Config file, based on:
* https://github.com/i0natan/nodebestpractices/blob/master/sections/projectstructre/configguide.md
*/
import path = require('path');
import dotenv = require('dotenv');

// setup dotenv
const dotEnvConfig = dotenv.config();

if (dotEnvConfig.error) {
  throw new Error('Error trying to load the .env file, did you copy the provided example? (run cp .example.env .env)');
}

// import nconf after dotenv config
import nconf = require('nconf');

// Set node_env to development if node_env is undefined
if (!process.env.NODE_ENV) {
  process.stdout.write('NODE_ENV is not defined, using development as default\n');
  process.env['NODE_ENV'] = 'development';
}

/**
* Choose config file
* @returns Config file path
*/
const getConfigFile = (): string => {
  const env = process.env.NODE_ENV.toLowerCase();
  const configPath = path.join(__dirname, `/environments/${env}.config.json`.replace('/', path.sep));
  return configPath;
};

/**
* Setup nConf
* load in order, most important first
*/

// argv is the most important, env variables are second
nconf.argv();

nconf.env({
  // convert all input keys to lowercase
  lowerCase: true,
  // use '__' as separator for nested keys in .env file or env parameters
  separator: '__',
  // try to parse values into their proper types
  parseValues: true
});

// setup file hierarchy, config file for environment (example: production.config.json) overrides the default config
nconf.file('config', getConfigFile());

// nconf defaults (less important, everything here is overridden by the upper configs)
nconf.defaults({
  server: {
    name: 'Mango',
    host: 'localhost',
    port: 3000,
    api_prefix: '/api/v1/'
  },
  database: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    name: 'mango',
    prefix: 'mango_',
    synchronize: true,
    logging: false,
    cache: true,
    retry: {
      enabled: true,
      attempts: 5,
      seconds: 10
    }
  },
  redis: {
    host: 'localhost',
    port: 6379,
    auth: ''
  },
  logging: {
    level: 'info',
    file: {
      enabled: false,
      folder: '/logs',
      size: '50m',
      duration: '7d'
    }
  },
  auth: {
    salt_rounds: 12,
  },
  jwt: {
    token_life: '7d',
    refresh_token_max_life: '14d'
  },
  uploads: {
    folder: '/public/uploads',
    profile_pictures: {
      resolutions: [32, 64, 96, 240, 480],
      allowed_formats: ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'],
      folder: '/public/uploads/images',
      max_size: 54525952,
    }
  }
});

export default nconf;
