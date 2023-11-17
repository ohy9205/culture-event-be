const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.json({
        code: 404,
        message: "이메일 주소가 잘못되었습니다.",
      });
    } else {
      // 이메일은 존재하고, 비밀번호 인증을 해야 함.
      const result = await bcrypt.compare(password, exUser.password);
      if (!result) {
        return res.json({
          code: 404,
          message: "비밀번호가 일치하지 않습니다.",
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
          .cookie("rt", refreshToken, {
            // path: "/",
            httpOnly: true,
            secure: true,
          })
          .json({
            code: 200,
            message: "로그인 성공, 토큰 발급",
            at: token,
          });
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
