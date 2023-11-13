const express = require("express");
const {
  getEvents,
  getEventsById,
  increaseViewCount,
} = require("../controllers/v2");

const { verfiyLoginUser } = require("../middlewares");

const router = express.Router();

router.get("/events", verfiyLoginUser, getEvents);

router.get("/events/:id", verfiyLoginUser, getEventsById, increaseViewCount);

module.exports = router;
