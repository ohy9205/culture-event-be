// NOTE 댓글은 로그인한 사용자만 달 수 있음!
// 그렇다면 로그인 검증을 어디서 하느냐? 프론트? 백엔드?
// '유저 정보'

const Comment = require("../models/comment");
const User = require("../models/user");

// 유저 정보를 요청했을 때 유저가 작성한 댓글들이 보여야 한다.
// 게시글 정보를 요청했을 때, 모든 유저가 작성한 댓글들이 보여야 한다.

exports.addComment = async (req, res) => {
  const { user } = res.locals.user; // 로그인한 사용자 정보
  const { content, eventId } = req.body; // 댓글 내용, 이벤트 id

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

exports.updateComment = async (req, res, next) => {
  const commentId = req.params.id;
  const { content } = req.body;
  const { user } = res.locals.user;

  console.log("User ID", user.id);

  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.json({
        code: 404,
        message: "댓글을 찾을 수 없습니다",
      });
    }

    if (user.id !== comment.commenter) {
      return res.status(404).json({
        code: 404,
        message: "본인이 아닌 사용자가 댓글 수정을 시도합니다.",
      });
    }

    await comment.update({ content });

    return res.status(200).json({
      code: 200,
      message: "댓글이 정상적으로 수정되었습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.id;
  const { user } = res.locals.user;

  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.json({
        code: 404,
        message: "댓글을 찾을 수 없습니다",
      });
    }

    if (user.id !== comment.commenter) {
      return res.status(404).json({
        code: 404,
        message: "본인이 작성한 댓글만 삭제 가능합니다.",
      });
    }

    await comment.destroy();

    return res.status(200).json({
      code: 200,
      message: "댓글을 정상적으로 삭제하였습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
