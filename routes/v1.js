const express = require("express");
const { getEvents, getEventsByTitle } = require("../controllers/v1");

const router = express.Router();

router.get("/events", getEvents);

router.get("/events/:title", getEventsByTitle);

module.exports = router;
