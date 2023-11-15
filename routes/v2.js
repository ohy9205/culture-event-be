const express = require("express");
const {
  getEvents,
  increaseViewCount,
  toggleLikeState,
  getLikedCount,
} = require("../controllers/v2");

const { verfiyLoginUser } = require("../middlewares");
const { getEventById } = require("../controllers/v1");

const router = express.Router();

router.get("/events", verfiyLoginUser, getEvents);

router.get("/events/:id", verfiyLoginUser, getEventById, increaseViewCount);

// 좋아요 기능을 위한 라우트 필요
router.post("/events/:id/likes", verfiyLoginUser, toggleLikeState);

// 좋아요 갯수를 가져오기
router.get("/events/:id/likes", verfiyLoginUser, getLikedCount);

module.exports = router;
