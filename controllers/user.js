const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.getUserMe = async (req, res) => {
  // 토큰으로 사용자 정보 확인하기
  // at 검증 이후 로직임.
  const token = req.header("Authorization").split(" ")[1];
  const refreshToken = req.cookies.rt;

  if (!refreshToken)
    return res.json({
      code: 404,
      message: "Refresh Token이 없습니다. 잘못된 접근입니다.",
    });

  if (!token)
    return res.json({ code: 404, message: "Access Token이 없습니다." });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        jwt.verify(
          refreshToken,
          process.env.RT_SECRET,
          async (err, decoded) => {
            if (err) {
              if (err.name === "TokenExpiredError") {
                return res.json({
                  code: 404,
                  message:
                    "토큰이 모두 만료되었습니다. 다시 로그인하시기 바랍니다.",
                });
              } else {
                return res.json({
                  code: 404,
                  message:
                    "토큰이 유효하지 않습니다. 다시 로그인하시기 바랍니다.",
                });
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
                  {
                    id: exUserId,
                    email: exUserEmail,
                  },
                  process.env.RT_SECRET,
                  {
                    expiresIn: "15d",
                    issuer: "mk",
                  }
                );

                const userEmail = decoded.email;
                await User.findOne({
                  where: { email: userEmail },
                  attributes: ["email", "nick"],
                })
                  .then((user) => {
                    console.log("set cookie, json 데이터 보내기");
                    res
                      .cookie("rt", newRefreshToken, {
                        httpOnly: true,
                      })
                      .json({
                        code: 200,
                        payload: user,
                        at: newAccessToken,
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                    return res.status(500).json({
                      code: 500,
                      message: "서버 에러?",
                    });
                  });
              } else {
                const userEmail = decoded.email;
                await User.findOne({
                  where: { email: userEmail },
                  attributes: ["email", "nick"],
                })
                  .then((user) => {
                    console.log("json 데이터 보내기");
                    res.json({
                      code: 200,
                      payload: user,
                      at: newAccessToken,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    return res.status(500).json({
                      code: 500,
                      message: "서버 에러?",
                    });
                  });
              }
            }
          }
        );
      } else {
        res.status(401).json({ code: 401, message: err.name });
      }
    } else {
      const userEmail = decoded.email;
      await User.findOne({
        where: { email: userEmail },
        attributes: ["email", "nick"],
      })
        .then((user) => {
          res.json({
            code: 200,
            payload: user,
          });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({
            code: 500,
            message: "서버 에러?",
          });
        });
    }
  });
};
