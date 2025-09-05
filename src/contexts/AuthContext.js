import React, { createContext, useState, useEffect } from 'react';

// Context 생성
export const AuthContext = createContext(null);

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 컴포넌트가 처음 렌더링될 때 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 로그인 함수
  const login = (email, password) => {
    // TODO: 실제로는 서버와 통신하여 로그인 처리
    console.log('로그인 시도:', email);
    const userData = { email, name: '사용자' }; // 임시 사용자 데이터
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // 회원가입 함수
  const signup = (email, password) => {
    // TODO: 실제로는 서버와 통신하여 회원가입 처리
    console.log('회원가입 시도:', email);
    // 성공 시 자동으로 로그인되도록 처리 가능
    const userData = { email, name: '신규 사용자' };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = { user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};