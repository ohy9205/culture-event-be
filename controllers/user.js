const Comment = require("../models/comment");
const Event = require("../models/event");
const User = require("../models/user");

exports.getUserMe = async (req, res) => {
  const { code, user, at } = res.locals.user;

  return res.json({
    code,
    payload: user,
    at,
  });
};

exports.getUserComments = async (req, res) => {
  const { code, user, at } = res.locals.user;

  try {
    const comments = await Comment.findAll({
      include: {
        model: User,
        where: { email: user.email },
      },
    });
    return res.json({
      code,
      payload: comments,
      at,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getUserLikeEvent = async (req, res) => {
  // 반환해야 하는 값 event의 id, title, period, thumbnail 4개를 묶어서 보내줘야 함.
  const { user } = res.locals.user;
  const userId = user.id;

  try {
    const userInfo = await User.findByPk(userId, {
      include: [{ model: Event, through: "favoriteEvent" }],
    });

    if (!userInfo) {
      return res.status(404).json({
        code: 404,
        message: "유저를 찾을 수 없습니다",
      });
    }

    const userLikeEvent = userInfo.Events;

    const data = userLikeEvent.map((event) => {
      return {
        id: event.id,
        title: event.title,
        period: event.eventPeriod,
        thumbnail: event.thumbnail,
      };
    });

    return res.json({
      code: 200,
      payload: data,
    });
  } catch (err) {
    console.error(err);
  }
};
