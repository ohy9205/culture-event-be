const bcrypt = require("bcrypt");
const passport = require("passport");
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
    const exUser = await User.findOne({ where: email });
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
        res.json({
          code: 200,
          message: "로그인 성공, 토큰 발급",
          at: token,
          rt: refreshToken,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

exports.verifyRefreshToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    res.status(401).json({ code: 401, message: "Refresh Token이 없습니다" });
  }

  jwt.verify(token, process.env.RT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        res
          .status(401)
          .json({ code: 401, message: "Refresh Token이 만료되었습니다" });
      } else {
        res
          .status(401)
          .json({ code: 401, message: "토큰 검증에 실패했습니다." });
      }
    } else {
      const expirationDate = new Date(decoded.exp * 1000);
      const currentDate = new Date();
      const timeDiff = expirationDate - currentDate;

      const daysUntilExpiration = timeDiff / (1000 * 60 * 60 * 24);
      const exUserId = decoded.id;
      const exUserEmail = decoded.email;

      const newAccessToken = jwt.sign(
        {
          id: exUserId,
          email: exUserEmail,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1m",
          issuer: "mk",
        }
      );

      if (daysUntilExpiration < 7) {
        const newRefreshToken = jwt.sign(
          { id: exUserId, email: exUserEmail },
          process.env.RT_SECRET,
          { expiresIn: "15d", issuer: "mk" }
        );
        res.status(200).json({
          code: 200,
          message: "AccessToken, RefreshToken이 새로 발급되었습니다",
          at: newAccessToken,
          rt: newRefreshToken,
        });
      } else {
        res.status(200).json({
          code: 200,
          message: "AccessToken이 새로 발급되었습니다",
          at: newAccessToken,
        });
      }
    }
  });
};
