const { Event } = require("../models");
const { Op } = require("sequelize");

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
    const { category, location, isfree, keyword, start, end, latest } =
      req.query;
    const orderOption =
      req.query.orderBy === "views"
        ? [["views", "DESC"]]
        : [["startDate", "ASC"]];

    let where = {};
    if (category) where.category = category;
    if (location) where.location = location;
    if (isfree) where.isFree = isfree === "무료";
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start && end) {
      where.startDate = { [Op.gte]: start, [Op.lte]: end };
    } else if (latest === "today") {
      where.startDate = { [Op.gte]: currentDate() };
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
    const { category, location, isfree, keyword, start, end, latest } =
      req.query;
    const orderOption =
      req.query.orderBy === "views"
        ? [["views", "DESC"]]
        : [["startDate", "ASC"]];

    let where = {};
    if (category) where.category = category;
    if (location) where.location = location;
    if (isfree) where.isFree = isfree === "무료";
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (start && end) {
      where.startDate = { [Op.gte]: start, [Op.lte]: end };
    } else if (latest === "today") {
      where.startDate = { [Op.gte]: currentDate() };
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
    const event = await Event.findByPk(eventId);

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

exports.getEventsByViews = async (req, res) => {
  await Event.findAll({
    order: ["views", "DESC"],
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
