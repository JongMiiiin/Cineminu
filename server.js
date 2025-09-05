const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db'); // db.js 파일
const authMiddleware = require('./authMiddleware'); // authMiddleware.js 파일

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// --- API 엔드포인트 ---

// [POST] /api/register - 회원가입
app.post('/api/register', async (req, res) => {
  const { username, password, nickname } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ message: 'ID, 비밀번호, 닉네임을 모두 입력해주세요.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      'INSERT INTO users (username, password, nickname) VALUES ($1, $2, $3) RETURNING id, username, nickname',
      [username, hashedPassword, nickname]
    );
    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    if (error.code === '23505') {
      if (error.constraint === 'users_username_key') {
        return res.status(409).json({ message: '이미 사용 중인 ID입니다.' });
      }
      if (error.constraint === 'users_nickname_key') {
        return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
      }
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// [POST] /api/login - 로그인
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'ID와 비밀번호를 모두 입력해주세요.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: '로그인 성공',
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// [GET] /api/reviews - 로그인한 사용자의 모든 리뷰 가져오기
app.get('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const allReviews = await db.query(
      'SELECT * FROM reviews WHERE user_id = $1 ORDER BY review_date DESC',
      [req.user.id]
    );
    res.status(200).json(allReviews.rows);
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    res.status(500).json({ message: '리뷰를 가져오는 데 실패했습니다.' });
  }
});

// [POST] /api/reviews - 새 리뷰 저장 또는 기존 리뷰 업데이트
app.post('/api/reviews', authMiddleware, async (req, res) => {
  const { date, movie, reviewText, posterPath } = req.body;
  const userId = req.user.id;

  if (!movie || !movie.movieCd || !movie.movieNm) {
    return res.status(400).json({ message: '영화 정보가 올바르지 않습니다.' });
  }

  try {
    const upsertQuery = `
      INSERT INTO reviews (user_id, review_date, movie_cd, movie_title, poster_path, review_text)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, review_date) 
      DO UPDATE SET 
        movie_cd = EXCLUDED.movie_cd,
        movie_title = EXCLUDED.movie_title,
        poster_path = EXCLUDED.poster_path,
        review_text = EXCLUDED.review_text
      RETURNING *;
    `;
    const result = await db.query(upsertQuery, [userId, date, movie.movieCd, movie.movieNm, posterPath, reviewText]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('리뷰 저장 오류:', error);
    res.status(500).json({ message: '리뷰를 저장하는 데 실패했습니다.' });
  }
});

// [DELETE] /api/reviews/:date - 특정 날짜의 리뷰 삭제
app.delete('/api/reviews/:date', authMiddleware, async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  try {
    await db.query(
      'DELETE FROM reviews WHERE user_id = $1 AND review_date = $2',
      [userId, date]
    );
    res.status(204).send();
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    res.status(500).json({ message: '리뷰를 삭제하는 데 실패했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});