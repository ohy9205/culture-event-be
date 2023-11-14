const jwt = require("jsonwebtoken");
const User = require("../models/user");

// TODO 로그인 인증이 필요한 라우터 앞에 붙일 미들웨어 (로그아웃 상태는 관심없음)
exports.verfiyLoginUser = (req, res, next) => {
  const accessToken = req.header("Authorization").split(" ")[1];
  const refreshToken = req.cookies.rt;

  // 로그인 상태를 검증하는 것이기 때문에, at, rt 하나라도 문제 있으면 오류임
  if (!accessToken || !refreshToken) {
    return res.json({
      code: 404,
      message: "Token이 존재하지 않습니다. 다시 로그인하시기 바랍니다.",
    });
  }

  // 토큰이 존재함 (유효 여부와 관계 없이)
  jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // at 만료
        console.log("at 만료");
        jwt.verify(
          refreshToken,
          process.env.RT_SECRET,
          async (err, decoded) => {
            if (err) {
              if (err.name === "TokenExpiredError") {
                // at, rt 모두 만료되었다.
                return res.json({
                  code: 404,
                  message:
                    "토큰이 모두 만료되었습니다. 다시 로그인하시기 바랍니다.",
                });
              } else {
                // 만료가 아닌 다른 에러가 있다.
                return res.json({
                  code: 404,
                  message:
                    "토큰이 유효하지 않습니다. 다시 로그인하시기 바랍니다.",
                });
              }
            } else {
              // at 만료, rt 정상 -> at 재발급 필요 + rt 만료 체크
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
                { expiresIn: "1m", issuer: "mk" }
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
                  attributes: ["id", "email", "nick"],
                })
                  .then((user) => {
                    res.locals.user = {
                      code: 200,
                      user,
                      at: newAccessToken,
                    };
                    res.cookie("rt", newRefreshToken, {
                      httpOnly: true,
                      secure: true,
                    });
                    next();
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
                  attributes: ["id", "email", "nick"],
                })
                  .then((user) => {
                    res.locals.user = {
                      code: 200,
                      user,
                      at: newAccessToken,
                    };
                    next();
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
      // at 유효, rt 검증
      console.log("at 유효");
      jwt.verify(refreshToken, process.env.RT_SECRET, async (err, decoded) => {
        const expirationDate = new Date(decoded.exp * 1000);
        const currentDate = new Date();
        const timeDiff = expirationDate - currentDate;
        const daysUntilExpiration = timeDiff / (1000 * 60 * 60 * 24);

        if (err) {
          if (err.name === "TokenExpiredError") {
            // at 유효, rt 만료 이게 가능한 상황인가...
            // rt 갱신하고 데이터 보내주기

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
              attributes: ["id", "email", "nick"],
            })
              .then((user) => {
                res.locals.user = {
                  code: 200,
                  user,
                };
                res.cookie("rt", newRefreshToken, {
                  httpOnly: true,
                  secure: true,
                });
                next();
              })
              .catch((err) => {
                console.error(err);
                return res.status(500).json({
                  code: 500,
                  message: "서버 에러?",
                });
              });
          } else {
            // at 유효, rt가 유효하지 않은 토큰
            // 다시 로그인하시오
            return res.json({
              code: 404,
              message: "토큰이 유효하지 않습니다. 다시 로그인하시기 바랍니다.",
            });
          }
        } else {
          // 에러 없음
          // rt 확인만하고 데이터 보내주기

          if (daysUntilExpiration < 7) {
            const newRefreshToken = jwt.sign(
              {
                id: decoded.id,
                email: decoded.email,
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
              attributes: ["id", "email", "nick"],
            })
              .then((user) => {
                res.locals.user = {
                  code: 200,
                  user,
                  at: newAccessToken,
                };
                res.cookie("rt", newRefreshToken, {
                  httpOnly: true,
                  secure: true,
                });
                next();
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
              attributes: ["id", "email", "nick"],
            })
              .then((user) => {
                res.locals.user = {
                  code: 200,
                  user,
                };
                next();
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
      });
    }
  });
};
