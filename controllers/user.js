const Comment = require("../models/comment");
const Event = require("../models/event");
const User = require("../models/user");

exports.getUserMe = async (req, res) => {
  const { code, user, at } = res.locals.user;

  return res.status(200).json({
    result: "success",
    message: "유저 정보를 가져오는데 성공했습니다.",
    payload: { user, at },
  });
};

exports.getUserComments = async (req, res, next) => {
  const { code, user, at } = res.locals.user;

  try {
    const comments = await Comment.findAll({
      include: {
        model: User,
        where: { email: user.email },
        attributes: ["id", "email", "nick"],
      },
    });
    const eventIds = comments.map((comment) => comment.eventId);

    const commentsWithEvents = await Comment.findAll({
      include: [
        {
          model: User,
          where: { email: user.email },
          attributes: ["id", "email", "nick"],
        },
        {
          model: Event,
          where: { id: eventIds },
          attributes: ["title", "eventPeriod", "thumbnail"],
        },
      ],
    });

    return res.status(200).json({
      result: "success",
      message: "사용자가 작성한 댓글들을 모두 가져왔습니다.",
      payload: {
        commentsWithEvents,
        at,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getUserLikeEvent = async (req, res, next) => {
  // 반환해야 하는 값 event의 id, title, period, thumbnail 4개를 묶어서 보내줘야 함.
  const { user, at } = res.locals.user;
  const userId = user.id;

  try {
    const userInfo = await User.findByPk(userId, {
      include: [{ model: Event, through: "favoriteEvent" }],
    });

    const userLikeEvent = userInfo.Events;

    const data = userLikeEvent.map((event) => {
      return {
        id: event.id,
        title: event.title,
        period: event.eventPeriod,
        thumbnail: event.thumbnail,
      };
    });

    return res.status(200).json({
      result: "success",
      message: "사용자가 좋아하는 게시글을 모두 가져왔습니다.",
      payload: {
        data,
        at,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
