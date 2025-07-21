import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Cookies from 'js-cookie';
import { setUser } from '../features/marketplace/slices/userSlice';
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
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      if (res.data.success) {
        Cookies.set('token', res.data.token, { expires: 7 });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        dispatch(setUser(res.data.user));
        dispatch(fetchCurrentUser());
        setEmail('');
        setPassword('');
        localStorage.removeItem('prefillEmail');
        navigate('/');
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

  const isInvalid = (val: string) => val.trim().length === 0;

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex justify-center mt-10">
      <Toast ref={toast} />
      <div className="card w-full max-w-sm p-5">
        <h2 className="text-2xl text-center mb-5">Login</h2>

        <div className="p-fluid">
          <div className="p-field mb-4">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={isInvalid(email) ? 'p-invalid' : ''}
              placeholder="Enter your email"
              readOnly={!!user?.email}
            />
          </div>

          <div className="p-field mb-5">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              className={isInvalid(password) ? 'p-invalid' : ''}
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-center mb-3">{errorMessage}</div>
          )}

          <Button
            label="Login"
            onClick={handleLogin}
            disabled={
              isInvalid(email) || isInvalid(password) || !isEmailValid(email)
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
