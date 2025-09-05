import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../LoginPage.css';

function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!id || !password) {
      alert('ID와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/login', {
        username: id,
        password: password,
      });

      const { token, user } = response.data;
      
      // Context의 login 함수를 호출하여 상태 업데이트 및 localStorage 저장
      login(user, token);

      alert('로그인에 성공했습니다!');
      navigate('/'); // 홈 페이지로 이동

    } catch (err) {
      const errorMessage = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('로그인 실패:', err);
    }
  };

  return (
    <div className="login-page-container">
      <h1 className="login-title">로그인</h1>
      
      <div className="login-form-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID를 입력하세요"
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
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
        
        <Link to="/signup" className="signup-link">
          회원가입
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;