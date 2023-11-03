const express = require("express");
const passport = require("passport");

const { signIn, signUp, logout } = require("../controllers/auth");

const router = express.Router();

router.post("/signUp", signUp);

router.post("/signIn", signIn);

router.get("/logout", logout);

router.post();
