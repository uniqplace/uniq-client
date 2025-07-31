import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/slices/userSlice';

export const useAuthUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('[useAuthUser] effect triggered');
    const token = Cookies.get('token');
    console.log('[useAuthUser] token from cookies:', token);
    const userStr = localStorage.getItem('user');
    console.log('[useAuthUser] user string from localStorage:', userStr);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('[useAuthUser] parsed user:', user);
        dispatch(setUser(user));
        console.log('[useAuthUser] user dispatched');
      } catch (err) {
        console.error('[useAuthUser] Failed to parse user from localStorage:', err);
      }
    } else {
      if (!token) console.log('[useAuthUser] No token found');
      if (!userStr) console.log('[useAuthUser] No user found in localStorage');
    }
  }, [dispatch]);
};