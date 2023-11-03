const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    res.locals.decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.json({
        code: 419,
        message: "토큰이 만료되었습니다",
      });
    }
    return res.json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};
