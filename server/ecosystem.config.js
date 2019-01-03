module.exports = {
  apps: [{
    name: 'Mango',
    cwd: './dist/',
    script: 'www.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
