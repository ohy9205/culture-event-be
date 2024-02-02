const { Event } = require("../models");
const { Op, or } = require("sequelize");
const Comment = require("../models/comment");
const { User } = require("../models");
const currentDate = () => {
  return new Date().toISOString().slice(0, 10);
};

exports.getEvents = async (req, res, next) => {
  if (req.query.pageIndex && req.query.pageSize) {
    // 페이지네이션 사용
    const pageIndex = Number(req.query.pageIndex);
    const pageSize = Number(req.query.pageSize);
    let offset = 0;

    if (pageIndex > 1) {
      offset = pageSize * (pageIndex - 1);
    }
    const { category, location, isFree, keyword, start, end, orderBy } =
      req.query;

    let where = {};
    let orderOption = [];

    if (orderBy === "views") {
      orderOption = [["views", "DESC"]];
    } else if (orderBy === "latest") {
      where.startDate = { [Op.gte]: currentDate() };
      orderOption = [
        ["startDate", "ASC"],
        ["endDate", "ASC"],
        ["title", "ASC"],
      ];
    } else if (orderBy === "likes") {
      orderOption = [
        ["likes", "DESC"],
        ["views", "DESC"],
      ];
    } else {
      orderOption = [
        ["startDate", "ASC"],
        ["endDate", "ASC"],
        ["title", "ASC"],
      ];
    }
    if (category) where.category = category;
    if (location) where.location = location;
    if (isFree) where.isFree = isFree === "무료";
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start && end) {
      where.startDate = { [Op.gte]: start, [Op.lte]: end };
    }

    await Event.findAndCountAll({
      where,
      order: orderOption,
      limit: pageSize,
      offset: offset,
    })
      .then((events) => {
        res.status(200).json({
          result: "success",
          message: "이벤트 정보 가져오기 성공",
          payload: {
            totalPage: Math.ceil(events.count / pageSize),
            events,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  } else {
    // 페이지네이션 사용 X
    const { category, location, isFree, keyword, start, end, orderBy } =
      req.query;

    let where = {};
    let orderOption = [];

    if (orderBy === "views") {
      orderOption = [["views", "DESC"]];
    } else if (orderBy === "latest") {
      where.startDate = { [Op.gte]: currentDate() };
      orderOption = [
        ["startDate", "ASC"],
        ["endDate", "ASC"],
        ["title", "ASC"],
      ];
    } else if (orderBy === "likes") {
      orderOption = [
        ["likes", "DESC"],
        ["views", "DESC"],
      ];
    } else {
      orderOption = [
        ["startDate", "ASC"],
        ["endDate", "ASC"],
        ["title", "ASC"],
      ];
    }
    if (category) where.category = category;
    if (location) where.location = location;
    if (isFree) where.isFree = isFree === "무료";
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start && end) {
      where.startDate = { [Op.gte]: start, [Op.lte]: end };
    }

    await Event.findAll({
      order: orderOption,
      where,
    })
      .then((events) => {
        res.status(200).json({
          result: "success",
          message: "이벤트 정보 가져오기 성공",
          payload: {
            events,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  }
};

exports.increaseViewCount = async (req, res, next) => {
  try {
    const event = res.locals.event;
    const { at } = res.locals.user;

    event.increment("views", { by: 1 });

    return res.status(200).json({
      result: "success",
      message: "이벤트 정보 가져오기 성공",
      payload: { event, at },
    });
  } catch (error) {
    console.error(error);
    next(err);
  }
};

exports.toggleLikeState = async (req, res, next) => {
  // NOTE 필요한것 유저 정보, 이벤트 아이디
  const { user } = res.locals.user;
  const userId = user.id;
  const eventId = Number(req.params.id);

  // 이벤트 아이디로 popular 카운트를 증가시켜야 할듯,...

  try {
    const userInfo = await User.findOne({
      where: { id: userId },
      include: [{ model: Event, through: "favoriteEvent" }],
    });
    const eventInfo = await Event.findByPk(eventId);

    if (!eventInfo) {
      return res.status(404).json({
        result: "fail",
        message: "이벤트를 찾을 수 없습니다",
        payload: {},
      });
    }
    const likedList = userInfo.Events;
    const isLiked = likedList.some((event) => {
      return event.id === eventId;
    });

    if (isLiked) {
      await userInfo.removeEvents(eventId);
      await eventInfo.decrement("likes", { by: 1 });
    } else {
      await userInfo.addEvents(eventId);
      await eventInfo.increment("likes", { by: 1 });
    }
    const updateEventInfo = await Event.findByPk(eventId);

    // 토글한이벤트 데이터
    // const rs = await getEventById(req, res, next);
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

    return res.status(201).json({
      result: "success",
      message: `이벤트 ${eventId}를 좋아요에서 ${
        isLiked ? "삭제" : "추가"
      }했습니다.`,
      payload: {
        action: isLiked ? "remove" : "add",
        event: {
          id: event.dataValues.id,
          title: event.dataValues.title,
          period: event.dataValues.eventPeriod,
          thumbnail: event.dataValues.thumbnail,
        },
        eventLikesCount: updateEventInfo.likes, // 변경된 값 사용
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
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

    res.locals.event = event;
    next();
  } catch (err) {
    console.error(err);
  }
};

exports.getEventComments = async (req, res, next) => {
  const eventId = Number(req.params.id);

  try {
    const eventInfo = await Event.findByPk(eventId);
    if (!eventInfo) {
      return res.status(404).json({
        result: "fail",
        message: "이벤트를 찾을 수 없습니다.",
        payload: {},
      });
    }

    const comments = await Comment.findAll({
      where: { eventId },
      include: { model: User, attributes: ["email", "nick"] },
    });

    return res.status(200).json({
      result: "success",
      message: "이벤트에 달린 댓글 가져오기 성공",
      payload: { comments },
    });
  } catch (err) {
    next(err);
  }
};
