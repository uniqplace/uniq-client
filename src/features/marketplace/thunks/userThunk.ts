import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState } from '../slices/userSlice';

const API_BASE = 'http://localhost:5002'; 

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return await res.json(); 
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: Partial<UserState>, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update');

      return data.user; // ← מחזיר רק את המשתמש המעודכן!
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// thunk להעלאת תמונת אבטר
export const updateUserAvatar = createAsyncThunk<
  string, // סוג התוצאה - ה־avatarUrl החדש
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

      const res = await fetch(`${API_BASE}/api/users/${userId}/avatar`, {
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
      return data.avatarUrl; // מחזיר את ה־URL
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);
