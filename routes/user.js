const express = require("express");
const { verifyAccessToken } = require("../middlewares");
const { getUserMe } = require("../controllers/user");

const router = express.Router();

router.get("/me", getUserMe);

module.exports = router;
