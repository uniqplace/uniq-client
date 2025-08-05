import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '../features/user/slices/userSlice';
import { fetchCurrentUser } from '../features/marketplace/thunks/userThunk';
import { initializeSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useRef<Toast>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        const user = res.data.user;
        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          avatar: user.avatar || null
        }));
        dispatch(setUser(res.data.user));
        dispatch(fetchCurrentUser());
        setEmail('');
        setPassword('');
        localStorage.removeItem('prefillEmail');
        
        const userId = res.data.user._id || res.data.user.id;
        const role = res.data.user.role;
        if (userId && role) {
          const socket = initializeSocket();
          socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
          console.log('User registered to socket:', { userId, role });
        }
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || 'Login failed');
      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.response?.data?.message || 'Invalid email or password',
        life: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Main Login Card */}
      <div className="luxury-card backdrop-blur-sm bg-white/95 border-0 shadow-luxury w-full max-w-md p-8 relative z-10">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-medium">
          <i className="pi pi-user text-2xl text-white"></i>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
        <p className="text-neutral-600 mb-8">Sign in to your account to continue</p>

        {/* Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="relative">
              <i className="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input pl-10"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <i className="pi pi-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input pl-10"
                feedback={false}
                toggleMask
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-error text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm text-neutral-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            className="w-full btn-primary text-lg py-4"
            loading={isLoading}
            disabled={isLoading}
          />
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            label="Continue with Google"
            icon="pi pi-google"
            className="w-full btn-outline"
            onClick={() => console.log('Google login')}
          />
          <Button
            label="Continue with GitHub"
            icon="pi pi-github"
            className="w-full btn-outline"
            onClick={() => console.log('GitHub login')}
          />
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Card */}
      <div className="mt-6 luxury-card bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center w-full max-w-md">
        <p className="text-primary-100 text-sm mb-4">
          Join our community of creators and manufacturers
        </p>
        <Button
          label="Create New Account"
          icon="pi pi-user-plus"
          className="w-full btn-outline border-white text-white hover:bg-white hover:text-primary-600"
          onClick={() => navigate('/register')}
        />
      </div>

      {/* Toast for notifications */}
      <Toast ref={toast} />
    </div>
  );
};

export default Login;
