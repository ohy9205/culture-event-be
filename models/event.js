const Sequelize = require("sequelize");
require("regenerator-runtime/runtime.js");

class Event extends Sequelize.Model {
  static initiate(sequelize) {
    Event.init(
      {
        category: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        location: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        eventPeriod: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        place: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        hostOrganization: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        targetAudience: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        fee: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        performerInfo: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        programInfo: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        otherInfo: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        homePage: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        latitude: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        longitude: {
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
        startDate: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        endDate: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        likes: {
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
  static assocaite(db) {
    db.Event.hasMany(db.Comment, {
      foreignKey: "eventId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.Event.belongsToMany(db.User, {
      through: "favoriteEvent",
      foreignKey: "eventId",
      onDelete: "CASCADE",
    });
  }
  static beforeBulkDestroy(options) {
    options.individualHooks = true; // 이 부분이 중요합니다.

    // 모든 삭제 작업이 시작되기 전에 호출
  }

  static beforeDestroy(event, options) {
    event.getComments().forEach(async (comment) => {
      await comment.destroy();
    });

    event.getUsers().forEach(async (user) => {
      await user.destroy();
    });
  }
}

module.exports = Event;
