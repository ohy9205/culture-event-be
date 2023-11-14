const express = require("express");
const {
  getLatestEvent,
  getMostPopularEvent,
  getEventById,
} = require("../controllers/v1");

const router = express.Router();

router.get("/events/latest", getLatestEvent);

router.get("/events/popular", getMostPopularEvent);

router.get("/events/:id", getEventById);

module.exports = router;
