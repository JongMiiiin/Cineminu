// src/pages/SignUpPage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../LoginPage.css'; // 로그인 페이지와 동일한 스타일 사용

function SignUpPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState(''); // ⭐️ 1. 닉네임 값을 저장할 상태 추가
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ⭐️ 2. 닉네임 필드도 비어있는지 확인하는 로직 추가
    if (!id || !password || !confirmPassword || !nickname) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // ⭐️ 3. 서버에 회원가입 요청 시 nickname도 함께 보냅니다.
      await axios.post('http://localhost:4000/api/register', {
        username: id,
        password: password,
        nickname: nickname,
      });

      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');

    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('회원가입 실패:', err);
    }
  };

  return (
    <div className="login-page-container">
      <h1 className="login-title">회원가입</h1>
      
      <div className="login-form-card">
        <form onSubmit={handleSubmit}>
          {/* ID, 비밀번호, 비밀번호 확인 입력 필드는 이전과 동일 */}
          <div className="input-group">
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="사용할 ID를 입력하세요"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          
          {/* 닉네임 입력 필드 UI는 이미 잘 작성되어 있습니다. */}
          <div className="input-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임을 입력하세요"
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            회원가입
          </button>
        </form>
        
        <Link to="/login" className="signup-link">
          이미 계정이 있으신가요? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignUpPage;