const express = require("express");
const { verfiyLoginUser } = require("../middlewares");
const { addComment } = require("../controllers/comment");

const router = express.Router();

router.post("/", verfiyLoginUser, addComment);

module.exports = router;
