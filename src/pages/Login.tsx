import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('prefillEmail');
    const savedName = localStorage.getItem('prefillName');
    if (savedEmail) setEmail(savedEmail);
    if (savedName) setName(savedName);

    localStorage.removeItem('prefillEmail');
    localStorage.removeItem('prefillName');
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
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
    }
  };

  const isInvalid = (val: string) => val.trim().length === 0;

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

          <div className="p-field mb-4">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={isInvalid(name) ? 'p-invalid' : ''}
              placeholder="Enter your name"
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
            disabled={isInvalid(email) || isInvalid(password)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
