const express = require("express");
const {
  getEvents,
  getEventsById,
  increaseViewCount,
} = require("../controllers/v1");
const { verifyAccessToken } = require("../middlewares");

const router = express.Router();

router.get("/events", verifyAccessToken, getEvents);

router.get("/events/:id", verifyAccessToken, getEventsById, increaseViewCount);

module.exports = router;
