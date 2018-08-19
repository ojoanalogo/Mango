module.exports = {
  apps : [{
    name      : 'Mango',
    cwd: './dist/server',
    script    : 'main.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }]
};
