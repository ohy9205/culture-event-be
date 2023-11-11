const express = require("express");
const { verfiyLoginUser } = require("../middlewares");

const router = express.Router();

router.post(verfiyLoginUser, "/");

router.get(verfiyLoginUser, "/:id");

module.exports = router;
