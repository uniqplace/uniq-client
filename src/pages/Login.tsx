import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const savedEmail = localStorage.getItem('prefillEmail');
    if (savedEmail) setEmail(savedEmail);
    localStorage.removeItem('prefillEmail');
    // נקה גם את הסיסמה מה-state
    setPassword('');
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      if (res.data.success) {
        Cookies.set('token', res.data.token, { expires: 7 });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // נקה את הערכים מה-state וה־localStorage
        setEmail('');
        setPassword('');
        localStorage.removeItem('prefillEmail');
        navigate('/');
      }
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Login failed';

      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: message,
        life: 4000,
      });
      setEmail('');
      setPassword('');
    }
  };

  const isInvalid = (val: string) => val.trim().length === 0;

  // Email format validation (simple regex)
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
