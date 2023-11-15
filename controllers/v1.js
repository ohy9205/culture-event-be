const Event = require("../models/event");
const User = require("../models/user");
const { Op } = require("sequelize");
const Comment = require("../models/comment");

const currentDate = () => {
  return new Date().toISOString().slice(0, 10);
};

exports.getLatestEvent = async (req, res) => {
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
      res.json({
        code: 200,
        payload: events,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "서버 에러?",
      });
    });
};

exports.getMostPopularEvent = async (req, res) => {
  await Event.findAndCountAll({
    order: [["views", "DESC"]],
    limit: 7,
    offset: 0,
  })
    .then((events) => {
      res.json({
        code: 200,
        payload: events,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "서버 에러?",
      });
    });
};

exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId, {
      include: {
        model: Comment,
        include: {
          model: User,
        },
      },
    });
    console.log("event id", event.id);
    const eventComment = event.Comments.map((comment) => {
      return {
        content: comment.content,
        writer: comment.User.email,
      };
    });

    if (!event) {
      return res.status(404).json({
        code: 404,
        message: "해당 id의 이벤트가 없습니다",
      });
    }
    // 이벤트 데이터와, 댓글 내용, 댓글 작성자 이메일이 같이 보내져야 함.
    // {event, CommentList}

    return res.json({
      code: 200,
      payload: {
        event,
        eventComment,
      },
    });
  } catch (err) {
    console.error(err);
  }
};
