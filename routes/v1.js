const express = require("express");
const {
  getEvents,
  getEventsById,
  increaseViewCount,
} = require("../controllers/v1");

const { verifyAccessToken } = require("../middlewares");

const router = express.Router();

router.get("/events", getEvents);

router.get("/events/:id", getEventsById, increaseViewCount);

// router.get("/events/:id/comment")

module.exports = router;
