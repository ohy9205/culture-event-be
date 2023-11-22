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

// 좋아요 기능을 위한 라우트 필요
router.post("/events/:id/likes", verfiyLoginUser, toggleLikeState);

module.exports = router;
