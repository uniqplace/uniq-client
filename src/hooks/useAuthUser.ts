import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/slices/userSlice';

export const useAuthUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setUser(user));
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
  }, [dispatch]);
};