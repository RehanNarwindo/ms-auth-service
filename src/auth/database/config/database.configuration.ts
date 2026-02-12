export default () => ({
  port: Number.parseInt(process.env.PORT, 10) || 3000,

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'auth_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
