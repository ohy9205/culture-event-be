const express = require("express");

const {
  signIn,
  signUp,
  verifyRefreshToken,
  signOut,
} = require("../controllers/auth");

const router = express.Router();

router.post("/signUp", signUp);

router.post("/signIn", signIn);

router.post("/signOut", signOut);

module.exports = router;
