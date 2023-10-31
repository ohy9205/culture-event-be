const Sequelize = require("sequelize");

class Event extends Sequelize.Model {
  static initiate(sequelize) {
    Event.init(
      {
        category: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        event_period: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        place: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        host_organization: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        target_audience: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        fee: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        performer_info: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        program_info: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        other_info: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        home_page: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        lat: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        lng: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        isFree: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        thumbnail: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        favorite: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Event",
        tableName: "events",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static assocaite(db) {}
}

module.exports = Event;
