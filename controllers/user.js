exports.getUserMe = async (req, res) => {
  // 미들웨어에서 로그인한 사용자인것을 판별하고 있음.
  // 여기는 그 다음 단계로 미들웨어에서 전달받은 데이터를 사용해서 클라이언트에게 반환하면 됨

  // user -> code, user, at?
  console.log("req.locals.user", req.locals.user);
  const {code, user, at} = req.locals.user;
  
  return res.json({
    code,
    user,
    at 
  })

};
