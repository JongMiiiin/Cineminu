import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// AuthContext를 쉽게 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};