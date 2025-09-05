import React from 'react';
import { Link } from 'react-router-dom';
// ⭐️ 경로 변경: 직접 만든 AuthContext의 useAuth 훅을 가져옵니다.
import { useAuth } from '../context/AuthContext'; 

function Header() {
  // ⭐️ Context로부터 user 정보와 logout 함수를 가져옵니다.
  const { user, logout } = useAuth();

  const mainNavLinks = [
    { path: '/', label: '영화 차트' },
    { path: '/search', label: '영화 검색' },
    { path: '/recommendations/movies', label: '추천 영화' },
    { path: '/recommendations/theaters', label: '추천 영화관' },
    { path: '/calendar', label: '캘린더' },
  ];

  // 로그인 상태일 때만 '마이 리뷰'와 '마이 페이지' 메뉴를 추가합니다.
  if (user) {
    mainNavLinks.push(
      { path: '/my-reviews', label: '마이 리뷰' },
      { path: '/profile', label: '마이 페이지' }
    );
  }

  return (
    <header style={styles.header}>
      {/* 1. 왼쪽 로고 */}
      <Link to="/" style={styles.logo}>
        cineminu
      </Link>

      {/* 2. 중앙 메인 메뉴 */}
      <nav style={styles.nav}>
        {mainNavLinks.map((link) => (
          <Link key={link.path} to={link.path} style={styles.navLink}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* 3. 오른쪽 인증 메뉴 */}
      <div style={styles.authNav}>
        {/* ⭐️ user 상태에 따라 조건부 렌더링 */}
        {user ? (
          <>
            <span style={styles.nickname}>{user.nickname}님</span>
            <button onClick={logout} style={styles.authButton}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.authLink}>
              로그인
            </Link>
            <Link to="/signup" style={{ ...styles.authLink, ...styles.signupButton }}>
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

// 스타일 객체
const styles = {
  header: {
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  logo: {
    textDecoration: 'none',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    fontSize: '1rem',
    padding: '0.5rem 0',
  },
  authNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  // ⭐️ 닉네임 스타일 추가
  nickname: {
    fontWeight: '600',
    color: '#333',
  },
  authLink: {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
  },
  signupButton: {
    backgroundColor: '#333',
    color: '#fff',
  },
  authButton: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
};

export default Header;