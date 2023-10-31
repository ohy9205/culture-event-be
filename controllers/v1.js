const { Event } = require("../models");

exports.getEvents = async (req, res) => {
  await Event.findAll({})
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

exports.getEventsByTitle = async (req, res) => {
  await Event.findAll({
    where: { title: req.params.title },
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

exports.getEventsByFilter = async (req, res) => {
  await Event.findAll({
    where: { category: req.params.category },
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
