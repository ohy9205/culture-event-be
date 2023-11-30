const Comment = require("../models/comment");
const Event = require("../models/event");
const User = require("../models/user");

exports.addComment = async (req, res) => {
  const { user } = res.locals.user; // 로그인한 사용자 정보
  const { content, eventId } = req.body; // 댓글 내용, 이벤트 id

  try {
    const userExist = await User.findOne({ where: { email: user.email } });
    if (!userExist) {
      return res.status(404).json({
        result: "fail",
        message: "등록되지 않은 회원입니다. (이 메시지가 나오면 연락주세요.)",
        payload: {},
      });
    }
    const exEvent = await Event.findOne({ where: { id: eventId } });
    if (!exEvent) {
      return res.status(404).json({
        result: "fail",
        message: "이벤트를 찾을 수 없습니다.",
        payload: {},
      });
    }
    const userId = userExist.id;

    const createResult = await Comment.create({
      commenter: userId,
      content,
      eventId,
    });

    return res.status(201).json({
      result: "success",
      message: "댓글 추가 성공",
      payload: { commentId: createResult.id, content },
    });
  } catch (err) {
    console.error(err);
    next(err);
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
      return res.status(404).json({
        result: "fail",
        message: "댓글을 찾을 수 없습니다",
        payload: {},
      });
    }

    if (user.id !== comment.commenter) {
      return res.status(403).json({
        result: "fail",
        message: "댓글 수정권한이 없습니다.",
        payload: {},
      });
    }

    await comment.update({ content });

    return res.status(200).json({
      result: "success",
      message: "댓글이 정상적으로 수정되었습니다.",
      payload: { content },
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
      return res.status(404).json({
        result: "fail",
        message: "댓글을 찾을 수 없습니다",
        payload: {},
      });
    }

    if (user.id !== comment.commenter) {
      return res.status(403).json({
        result: "fail",
        message: "댓글 삭제 권한이 없습니다.",
        payload: {},
      });
    }

    await comment.destroy();

    return res.status(204).json({
      result: "success",
      message: "댓글이 삭제되었습니다.",
      payload: {},
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
