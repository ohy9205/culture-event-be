const express = require("express");
const { getUserMe } = require("../controllers/user");
const { verfiyLoginUser } = require("../middlewares");

const router = express.Router();

router.get("/me", verfiyLoginUser, getUserMe);

module.exports = router;
