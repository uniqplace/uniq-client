import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState } from '../../user/slices/userSlice';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      
      // Check if backend API is localhost or service
      const isBackendLocalhost = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');
      // const isBackendService = API_BASE.includes('onrender.com') || API_BASE.includes('herokuapp.com') || API_BASE.includes('vercel.app');
      
      let requestConfig: RequestInit;
      
      if (isBackendLocalhost) {
        // Backend is localhost: Use cookies (same-site, works fine)
        document.cookie = `token=${token}; path=/`;
        requestConfig = {
          method: 'GET',
          credentials: 'include', // ✅ Include to send cookies
          headers: {
            'Content-Type': 'application/json',
          }
        };
      } else {
        // Backend is service: Use Authorization header (cross-site, cookies don't work)
        requestConfig = {
          method: 'GET',
          credentials: 'omit', // ✅ No CORS issues
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // ✅ Send token in header
          }
        };
      } 

      const res = await fetch(`${API_BASE}/users/me`, requestConfig); 
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (err: any) {
      console.error('fetchCurrentUser error:', err);
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: Partial<UserState>, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update');

      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserAvatar = createAsyncThunk<
  string,
  { file: File; userId: string },
  { rejectValue: string }
>(
  'user/updateUserAvatar',
  async ({ file, userId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('avatar', file);
      } else {
        return rejectWithValue('No file provided');
      }

      const res = await fetch(`${API_BASE}/avatar/${userId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || 'Failed to upload avatar');
      }

      const data = await res.json();
      console.log('Response from backend:', data);
      return data.avatarUrl;
    } catch (error) {
      return rejectWithValue('Failed to upload avatar');
    }
  }
);
