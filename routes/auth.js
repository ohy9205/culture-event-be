const express = require("express");

const { signIn, signUp, verifyRefreshToken } = require("../controllers/auth");

const router = express.Router();

router.post("/signUp", signUp);

router.post("/signIn", signIn);

module.exports = router;
