const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signUp = async (req, res, next) => {
  const { email, nick, password } = req.body;
  const emailReg = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;

  if (!emailReg.test(email)) {
    return res.status(403).json({
      result: "fail",
      message: "올바르지 않은 이메일 형식입니다.",
      payload: {},
    });
  }

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(409).json({
        result: "fail",
        message: "이미 사용중인 이메일입니다.",
        payload: {},
      });
    }
    const exNick = await User.findOne({ where: { nick } });
    if (exNick) {
      return res.status(409).json({
        result: "fail",
        message: "이미 사용중인 닉네임 입니다.",
        payload: {},
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.status(201).json({
      result: "success",
      message: "회원가입에 성공했습니다! 로그인 페이지로 이동하세요",
      payload: {
        email,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const emailReg = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;

  if (!emailReg.test(email)) {
    return res.status(403).json({
      result: "fail",
      message: "올바르지 않은 이메일 형식입니다.",
      payload: {},
    });
  }

  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.status(409).json({
        result: "fail",
        message: "로그인에 실패하였습니다.",
        payload: {},
      });
    } else {
      // 이메일은 존재하고, 비밀번호 인증을 해야 함.
      const result = await bcrypt.compare(password, exUser.password);
      if (!result) {
        return res.status(409).json({
          result: "fail",
          message: "로그인에 실패하였습니다.",
          payload: {},
        });
      } else {
        // token 만들어서 보내기
        const token = jwt.sign(
          {
            id: exUser.id,
            email: exUser.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1m",
            issuer: "mk",
          }
        );

        const refreshToken = jwt.sign(
          {
            id: exUser.id,
            email: exUser.email,
          },
          process.env.RT_SECRET,
          {
            expiresIn: "15d",
            issuer: "mk",
          }
        );

        res
          .status(200)
          .cookie("rt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .cookie("at", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .json({
            result: "success",
            message: "로그인 성공",
            payload: {
              id: exUser.id,
              email: exUser.email,
              nick: exUser.nick, // nick 정상적으로 보내지는지 확인 필요
              // at: token,
            },
          });
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.signOut = async (req, res, next) => {
  try {
  } catch (error) {}
  res
    .clearCookie("rt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .clearCookie("at", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      result: "success",
      message: "로그아웃 성공",
      payload: {},
    })
    .send();
};
