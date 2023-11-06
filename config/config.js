require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "seoul_event",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodejs",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: process.env.DATABASE_PASSWORD,
    database: "railway",
    host: "roundhouse.proxy.rlwy.net",
    port: 20765,
    dialect: "mysql",
  },
};
