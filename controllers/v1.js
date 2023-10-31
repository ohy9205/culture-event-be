const { Event } = require("../models");

exports.getEvents = (req, res) => {
  Event.findAll()
    .then((events) => {
      console.log("event", events);
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

exports.getEventsByTitle = (req, res) => {
  Event.findAll({ where: { title: req.params.title } }).then((events) => {
    console.log("matched event", events);
    res.json({
      code: 200,
      payload: events,
    });
  });
};
