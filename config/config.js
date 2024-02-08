require("dotenv").config();

module.exports = {
  development: {
    username: "ohy1015",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "ygrdb",
    host: "3.38.147.210",
    dialect: "postgres",
    schema: "public",
    port: "11015",
  },
  // test: {
  //   username: "root",
  //   password: process.env.SEQUELIZE_PASSWORD,
  //   database: "nodejs",
  //   host: "127.0.0.1",
  //   dialect: "mysql",
  // },
};
