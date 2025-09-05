import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // TODO: 서버에 프로필 업데이트 요청
    console.log(`프로필 업데이트: ${name}`);
    alert('프로필이 업데이트되었습니다. (데모)');
  };

  return (
    <div>
      <h1>마이페이지</h1>
      <p><strong>이메일:</strong> {user.email}</p>
      <form onSubmit={handleUpdateProfile}>
        <label htmlFor="name">이름: </label>
        <input 
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">프로필 수정</button>
      </form>
    </div>
  );
}

export default ProfilePage;