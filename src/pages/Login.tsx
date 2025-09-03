import { useEffect, useState, useRef } from 'react';
import socket from '../services/socket';
import {socket_events } from '../constants/socketEvents';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { setUser } from '../features/user/slices/userSlice';
import { fetchCurrentUser } from '../features/marketplace/thunks/userThunk';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import type { RootState } from '../store';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    setPassword('');
  }, [user]);

  const handleLogin = async () => {
    setErrorMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, 
        { email, password },
        { 
          withCredentials: true, // ✅ Add this for cross-site authentication
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.data.success) {
        // Store token in localStorage for cross-site API calls
        localStorage.setItem('token', res.data.token);
        const user = res.data.user;

        toast.current?.show({
          severity: 'success',
          summary: 'Registered',
          detail: 'You have successfully logged in.',
          life: 4000
        });

        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          avatar: user.avatar || null
        }));
        dispatch(setUser(res.data.user));
        dispatch(fetchCurrentUser());
        setEmail('');
        setPassword('');
        localStorage.removeItem('prefillEmail');

        // Connect to Socket.IO
        const userId = res.data.user._id || res.data.user.id;
        const role = res.data.user.role;
        if (userId && role) {
          socket.emit(socket_events.register_user, { userId, role });
          console.log('User registered to socket:', { userId, role });
        }

        setTimeout(() => {
          navigate('/');
        }, 1800);

      }
    } catch (error: unknown) {
      let message = 'Login failed. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message.toLowerCase();
        if (
          msg.includes('password') ||
          msg.includes('credential')
        ) {
          message = 'Email or password is incorrect. Please try again.';
        } else if (
          msg.includes('user already exists') ||
          msg.includes('email already exists')
        ) {
          message = 'This email is already registered. Please login or use a different email.';
        } else if (
          msg.includes('user') ||
          msg.includes('email')
        ) {
          message = 'Email or password is incorrect. Please try again.';
        } else {
          message = error.response.data.message;
        }
      }
      setErrorMessage(message);
      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: message,
        life: 4000,
      });
      setPassword('');
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const isInvalid = (val: string) => val.trim().length === 0;

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toast ref={toast} />
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <div className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Username
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isInvalid(email) ? 'border-red-500' : ''
              }`}
              placeholder="Enter your email"
              readOnly={!!user?.email}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              className={`w-full ${
                isInvalid(password) ? 'border-red-500' : ''
              }`}
              inputClassName="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-600 text-center text-sm">{errorMessage}</div>
          )}

          {/* Login Button */}
          <Button
            label="Login"
            icon="pi pi-user"
            onClick={handleLogin}
            disabled={
              isInvalid(email) || isInvalid(password) || !isEmailValid(email)
            }
            className="w-full bg-cyan-500 hover:bg-cyan-600 border-cyan-500 hover:border-cyan-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          />

          {/* OR Separator */}
          <div className="text-center">
            <span className="text-gray-700 text-sm font-medium">OR</span>
          </div>

          {/* Sign Up Button */}
          <Button
            label="Sign Up"
            icon="pi pi-user-plus"
            onClick={handleSignUp}
            className="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
