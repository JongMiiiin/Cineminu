// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" 형식

  if (token == null) return res.sendStatus(401); // 토큰이 없음

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // 토큰이 유효하지 않음
    req.user = user; // 요청 객체에 사용자 정보 저장
    next(); // 다음 미들웨어 또는 핸들러로 이동
  });
};

module.exports = authMiddleware;