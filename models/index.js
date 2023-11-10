const Sequelize = require("sequelize");
const Event = require("./event");
const User = require("./user");
const Comment = require("./comment");

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
db.Comment = Comment;

Event.initiate(sequelize);
User.initiate(sequelize);
Comment.initiate(sequelize);

Event.assocaite(db);
User.associate(db);
Comment.associate(db);

module.exports = db;
