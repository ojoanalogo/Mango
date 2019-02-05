/**
* Config file, based on:
* https://github.com/i0natan/nodebestpractices/blob/master/sections/projectstructre/configguide.md
*/
import * as path from 'path';
import * as dotenv from 'dotenv';
// setup dotenv
const dotEnvConfig = dotenv.config();

if (dotEnvConfig.error) {
  throw new Error('Error trying to load the .env file, did you copy the provided example?');
}

import * as nconf from 'nconf';

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
nconf.defaults({
  server: {
    host: 'localhost',
    port: 3000,
    instance: 1
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
    level: 'debug',
    file: {
      enabled: true,
      size: '50m',
      duration: '7d'
    }
  },
  auth: {
    saltRounds: 12,
    tokenDuration: '10m',
    refreshToken: '7d'
  },
  jwt: {
    life: '3d',
    maxlife: '7d'
  }
});

export default nconf;
