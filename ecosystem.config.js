module.exports = {
  apps: [{
    name: 'api',
    script: './dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    watch: false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
