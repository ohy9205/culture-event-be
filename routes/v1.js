const express = require("express");
const {
  getEvents,
  getEventsById,
  increaseViewCount,
} = require("../controllers/v1");

const router = express.Router();

router.get("/events", getEvents);

router.get("/events/:id", getEventsById, increaseViewCount);

module.exports = router;
