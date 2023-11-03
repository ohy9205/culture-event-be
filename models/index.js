const Sequelize = require("sequelize");
const Event = require("./event");
const User = require("./user");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Event = Event;
db.User = User;

Event.initiate(sequelize);
User.initiate(sequelize);

Event.assocaite(db);
User.associate(db);

module.exports = db;
