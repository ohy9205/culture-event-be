const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.signUp = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.json({
        code: 404,
        message: "이미 가입된 이메일입니다.",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.json({
      code: 200,
      message: "회원 가입 성공",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.signIn = (req, res, next) => {
  // session 만들고, 토큰도 줘야할거 같은데
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(error);
      return next(authError);
    }
    if (!user) {
      return res.json({
        code: 404,
        message: "존재하지 않는 회원입니다.",
      });
    }
    return req.login(user, (signInError) => {
      if (signInError) {
        console.error(signInError);
        return next(signInError);
      }
      return res.json({
        code: 200,
        message: "로그인 성공",
      });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.json({
      code: 200,
      message: "로그아웃 성공",
    });
  });
};
