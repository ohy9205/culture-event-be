// NOTE 댓글은 로그인한 사용자만 달 수 있음!
// 그렇다면 로그인 검증을 어디서 하느냐? 프론트? 백엔드?
// '유저 정보'

const Comment = require("../models/comment");
const User = require("../models/user");

// 유저 정보를 요청했을 때 유저가 작성한 댓글들이 보여야 한다.
// 게시글 정보를 요청했을 때, 모든 유저가 작성한 댓글들이 보여야 한다.

exports.addComment = async (req, res) => {
  // body에 댓글 내용
  // 이벤트 id도 있어야 함
  // 로그인한 유저 정보 들어있음.
  const { user } = res.locals.user; // 로그인한 사용자 정보
  const { content, eventId } = req.body; // 댓글 내용, 이벤트 id
  // DB에 저장
  // 로그인한 사용자 테이블에도 추가되어야 하고, 이벤트 테이블에도 추가되어야 함

  try {
    const userExist = await User.findOne({ where: { email: user.email } });
    if (!userExist) {
      return res.json({ code: 404, message: "등록되지 않은 회원입니다." });
    }
    const userId = userExist.id;

    await Comment.create({
      commenter: userId,
      content,
      eventId,
    });

    return res.json({ code: 200, message: "댓글 추가 성공" });
  } catch (err) {
    console.error(err);
  }
};
