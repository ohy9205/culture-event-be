const Event = require("../models/event");
const User = require("../models/user");
const { Op } = require("sequelize");
const Comment = require("../models/comment");

const currentDate = () => {
  return new Date().toISOString().slice(0, 10);
};

exports.getLatestEvent = async (req, res, next) => {
  await Event.findAndCountAll({
    where: {
      startDate: {
        [Op.gte]: currentDate(),
      },
    },
    order: [["startDate", "ASC"]],
    limit: 10,
    offset: 0,
  })
    .then((events) => {
      res.status(200).json({
        result: "success",
        message: "최신순 이벤트 가져오기 성공",
        payload: {
          events,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

exports.getMostViewsEvent = async (req, res, next) => {
  await Event.findAndCountAll({
    order: [["views", "DESC"]],
    limit: 10,
    offset: 0,
  })
    .then((events) => {
      res.status(200).json({
        result: "success",
        message: "좋아요 순으로 이벤트 가져오기 성공",
        payload: { events },
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

exports.getMostLikesEvent = async (req, res, next) => {
  await Event.findAndCountAll({
    order: [
      ["likes", "DESC"],
      ["views", "DESC"],
    ],
    limit: 7,
    offset: 0,
  })
    .then((events) => {
      res.status(200).json({
        result: "success",
        message: "좋아요 순으로 이벤트 가져오기 성공",
        payload: { events },
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

exports.getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Comment,
          include: {
            model: User,
            attributes: ["email", "nick"],
          },
        },
        {
          model: User,
          through: "favoriteEvent",
          attributes: ["email", "nick"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        result: "fail",
        message: "이벤트를 찾을 수 없습니다.",
        payload: {},
      });
    }

    return res.status(200).json({
      result: "success",
      message: "이벤트 정보 가져오기 성공",
      payload: { event },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
