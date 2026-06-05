module.exports = {
  apps: [{
    name: 'tienda-api',
    script: 'index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
