const jwt = require("jsonwebtoken");

exports.verifyAccessToken = (req, res, next) => {
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
        message: "만료된 AT 입니다",
      });
    }
    return res.json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

exports.verifyRefreshToken = (req, res, next) => {
  try {
    res.locals.rt = jwt.verify(
      req.headers.authorization,
      process.env.RT_SECRET
    )
    return next();
  }catch(error) {
    if(error.name === "TokenExpiredError") {
      return res.json({
        code: 419,
        message: "만료된 RT 입니다."
      })
    }
    return res.json({
      code: 401,
      message: "유효하지 않은 토큰입니다."
    })
  }
}