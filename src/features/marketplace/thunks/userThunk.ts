import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState } from '../slices/userSlice';

const API_BASE = 'http://localhost:5002'; // ודא שזה נכון

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return await res.json(); // ✅ החזרת כל המשתמש
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

      if (!res.ok) throw new Error('Failed to update profile');

      const data = await res.json();
      return data; // ✅ החזרת כל המשתמש המעודכן
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
