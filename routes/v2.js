const express = require("express");
const {
  getEvents,
  increaseViewCount,
  toggleLikeState,
  getEventById,
} = require("../controllers/v2");

const { verfiyLoginUser } = require("../middlewares");

const router = express.Router();

router.get("/events", verfiyLoginUser, getEvents);

router.get("/events/:id", verfiyLoginUser, getEventById, increaseViewCount);

router.post("/events/:id/likes", verfiyLoginUser, toggleLikeState);

module.exports = router;
