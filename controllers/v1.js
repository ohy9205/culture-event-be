const { Event } = require("../models");
const { Op } = require("sequelize");

exports.getEvents = async (req, res) => {
  if (req.query.pageIndex && req.query.pageSize) {
    const pageIndex = Number(req.query.pageIndex);
    const pageSize = Number(req.query.pageSize);
    let offset = 0;

    if (pageIndex > 1) {
      offset = pageSize * (pageIndex - 1);
    }
    const { category, location, isfree, keyword, start, end } = req.query;

    if (category || location || isfree || keyword || start || end) {
      await Event.findAndCountAll({
        where: {
          ...(category && { category }),
          ...(location && { location }),
          ...(isfree && { isFree: isfree === "무료" }),
          ...(keyword && { title: { [Op.like]: `%${keyword}%` } }),
          ...(start &&
            end && { startDate: { [Op.gte]: start, [Op.lte]: end } }),
        },
        order: [["startDate", "ASC"]],
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
      await Event.findAndCountAll({
        order: [["startDate", "ASC"]],
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
    }
  } else {
    const { category, location, isfree, keyword, start, end } = req.query;
    if (category || location || isfree || keyword || start || end) {
      await Event.findAll({
        order: [["startDate", "ASC"]],
        where: {
          ...(category && { category }),
          ...(location && { location }),
          ...(isfree && { isFree: isfree === "무료" }),
          ...(keyword && { title: { [Op.like]: `%${keyword}%` } }),
          ...(start &&
            end && { startDate: { [Op.gte]: start, [Op.lte]: end } }),
        },
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
    } else {
      await Event.findAll({
        order: [["startDate", "ASC"]],
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
