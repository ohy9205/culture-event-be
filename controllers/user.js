const Comment = require("../models/comment");
const User = require("../models/user");

exports.getUserMe = async (req, res) => {
  // 미들웨어에서 로그인한 사용자인것을 판별하고 있음.
  // 여기는 그 다음 단계로 미들웨어에서 전달받은 데이터를 사용해서 클라이언트에게 반환하면 됨

  // user -> code, user, at?
  console.log("getUserMe로 넘어옴");
  const { code, user, at } = res.locals.user;

  console.log("res.locals.at", at);
  // at가 있을 때는 at도 같이 보내야함. at가 없으면 undefined가 되고 프론트에서 undefined로 체크하고 있음
  return res.json({
    code,
    payload: user,
    at,
  });
};

exports.getUserComments = async (req, res) => {
  const { user, at } = res.locals.user;

  try {
    const comments = await Comment.findAll({
      include: {
        model: User,
        where: { email: user.email },
      },
    });
    console.log("comments", comments);
    return res.json({
      code: 200,
      message: `${user.id} 유저의 댓글 조회 성공`,
      payload: comments,
      at,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
