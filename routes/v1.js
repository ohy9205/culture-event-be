const express = require("express");
const {
  getLatestEvent,
  getMostViewsEvent,
  getEventById,
  getMostLikesEvent,
} = require("../controllers/v1");

const router = express.Router();

router.get("/events/latest", getLatestEvent);

router.get("/events/views", getMostViewsEvent);

router.get("/events/likes", getMostLikesEvent);

router.get("/events/:id", getEventById);

module.exports = router;
