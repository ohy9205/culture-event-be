const express = require("express");
const {
  getEvents,
  getEventsById,
  increaseViewCount,
} = require("../controllers/v1");
const cors = require("cors");

const router = express.Router();
router.use(
  cors({
    credentials: true,
  })
);

router.get("/events", getEvents);

router.get("/events/:id", getEventsById, increaseViewCount);

module.exports = router;
