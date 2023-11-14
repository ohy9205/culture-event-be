const { Event } = require("../models");
const { Op } = require("sequelize");
const Comment = require("../models/comment");
const { User } = require("../models");
const currentDate = () => {
  return new Date().toISOString().slice(0, 10);
};

exports.getEvents = async (req, res) => {
  if (req.query.pageIndex && req.query.pageSize) {
    // 페이지네이션 사용
    const pageIndex = Number(req.query.pageIndex);
    const pageSize = Number(req.query.pageSize);
    let offset = 0;

    if (pageIndex > 1) {
      offset = pageSize * (pageIndex - 1);
    }
    const { category, location, isfree, keyword, start, end, orderBy } =
      req.query;

    let where = {};
    let orderOption = [];

    console.log("orderBy", orderBy);

    if (orderBy === "views") {
      orderOption = [["views", "DESC"]];
    } else if (orderBy === "latest") {
      where.startDate = { [Op.gte]: currentDate() };
      orderOption = [["startDate", "ASC"]];
    } else {
      orderOption = [["startDate", "ASC"]];
    }
    if (category) where.category = category;
    if (location) where.location = location;
    if (isfree) where.isFree = isfree === "무료";
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
        res.json({
          code: 200,
          totalPage: Math.ceil(events.count / pageSize),
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
  } else {
    // 페이지네이션 사용 X
    const { category, location, isfree, keyword, start, end, orderBy } =
      req.query;

    let where = {};
    let orderOption = [];

    if (orderBy === "views") {
      orderOption = [["views", "DESC"]];
    } else if (orderBy === "latest") {
      where.startDate = { [Op.gte]: currentDate() };
      orderOption = [["startDate", "ASC"]];
    } else {
      orderOption = [["startDate", "ASC"]];
    }
    if (category) where.category = category;
    if (location) where.location = location;
    if (isfree) where.isFree = isfree === "무료";
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start && end) {
      where.startDate = { [Op.gte]: start, [Op.lte]: end };
    }

    await Event.findAll({
      order: orderOption,
      where,
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
  }
};

exports.getEventsById = async (req, res, next) => {
  // TODO 조회수 증가하는 로직 필요
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId, {
      include: {
        model: Comment,
      },
    });

    if (!event) {
      return res.status(404).json({
        code: 404,
        message: "해당 id의 이벤트가 없습니다.",
      });
    }
    res.locals.event = event;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.increaseViewCount = async (req, res, next) => {
  try {
    const event = res.locals.event;

    event.increment("views", { by: 1 });

    res.json({
      code: 200,
      payload: event,
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

  try {
    const userInfo = await User.findOne({
      where: { id: userId },
      include: [{ model: Event, through: "favoriteEvent" }],
    });
    const likedList = userInfo.Events;
    const isLiked = likedList.some((event) => {
      return event.id === eventId;
    });
    console.log("isLiked", isLiked);

    if (isLiked) {
      await userInfo.removeEvents(eventId);
      return res.json({
        code: 200,
        message: `이벤트 ${eventId}를 좋아요에서 삭제했습니다.`,
      });
    } else {
      // 좋아하는 이벤트가 아닌 경우, 추가
      await userInfo.addEvents(eventId);
      console.log(`이벤트 ${eventId}를 좋아요에 추가했습니다.`);
      return res.json({
        code: 200,
        message: `이벤트 ${eventId}를 좋아요에서 추가했습니다.`,
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};