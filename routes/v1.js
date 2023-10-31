const express = require("express");
const {
  getEvents,
  getEventsByTitle,
  getEventsByFilter,
} = require("../controllers/v1");

const router = express.Router();

router.get("/events", getEvents);

router.get("/events/filter/:category", getEventsByFilter);

router.get("/events/:title", getEventsByTitle);

module.exports = router;
