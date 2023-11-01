require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodejs",
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
    username: "seoul-event-info-user",
    password: process.env.DATABASE_PASSWORD,
    database: "seoul-event-info-database",
    host: "srv-captain--jdqurlwkvo-mysql-80x",
    dialect: "mysql",
  },
};
