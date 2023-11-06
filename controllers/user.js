const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.getUserMe = async (req, res) => {
  // 토큰으로 사용자 정보 확인하기
  // at 검증 이후 로직임.
  const token = req.header("Authorization").split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      res.status(401).json({ code: 401, message: "토큰 에러" });
    } else {
      const userEmail = decoded.email;

      await User.findOne({ where: { email: userEmail } })
        .then((user) => {
          res.json({
            code: 200,
            payload: user,
          });
        })
        .catch((err) => {
          console.error(err);
          return res.stats(500).json({
            code: 500,
            message: "서버 에러?",
          });
        });
    }
  });
};
