require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "database_development",
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || "db",
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};
