module.exports = {
  apps: [{
    name: 'mango',
    script: './dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
