const Sequelize = require("sequelize");
const Event = require("./event");

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

Event.initiate(sequelize);

Event.assocaite(db);

module.exports = db;
