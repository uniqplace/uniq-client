import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';

const Register: React.FC = () => {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);

  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5002/api/auth/profile', {
        fullName,
        email,
        password,
        role: 'user',
        avatar: ''
      });

      toast.current?.show({
        severity: 'success',
        summary : 'Registration Successful',
        detail  : 'Your account has been created!',
        life    : 4000
      });

      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary : 'Registration Error',
        detail  : err.response?.data?.message || 'Registration failed',
        life    : 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = (val: string) => val.trim().length === 0;

  return (
    <div className="flex justify-center mt-10">
      <Toast ref={toast} />
      <Card className="w-full max-w-md">
        <h2 className="text-2xl text-center mb-6">Register</h2>

        <form onSubmit={handleSubmit} className="p-fluid space-y-4">
          <span className="p-float-label">
            <InputText
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={classNames({ 'p-invalid': isInvalid(fullName) })}
            />
            <label htmlFor="fullName">Full Name</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classNames({ 'p-invalid': isInvalid(email) })}
            />
            <label htmlFor="email">Email</label>
          </span>

          <span className="p-float-label">
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              className={classNames({ 'p-invalid': isInvalid(password) })}
            />
            <label htmlFor="password">Password</label>
          </span>

          <Button
            type="submit"
            label="Create Account"
            icon="pi pi-user-plus"
            loading={loading}
            disabled={loading || isInvalid(fullName) || isInvalid(email) || isInvalid(password)}
            className="mt-2"
          />
        </form>
      </Card>
    </div>
  );
};

export default Register;
