const express = require("express");
const { verfiyLoginUser } = require("../middlewares");
const {
  addComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");

const router = express.Router();

router.post("/", verfiyLoginUser, addComment);

router.patch("/:id", verfiyLoginUser, updateComment);

router.delete("/:id", verfiyLoginUser, deleteComment);

module.exports = router;
