// ecosystem.config.cjs
// PM2 process manager config — keeps the Node.js backend alive on the VPS
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'enubuzor-backend',
      script: './server.js',
      cwd: '/var/www/enubuzor/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
