import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/marketplace/slices/userSlice';
import Cookies from 'js-cookie';
import { Dropdown } from 'primereact/dropdown';
import type { RegisterFormData } from '../types/index';
import { roleOptions } from '../constants/roles';
import type{ RootState } from '../store';

const schema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .matches(/^[A-Za-z\u0590-\u05FF\s]+$/, 'Full name must contain only letters (Hebrew or English)'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address. Please enter a valid email in the format: example@domain.com'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'At least 6 characters')
    .matches(/[a-z]/, 'At least one lowercase letter')
    .matches(/[A-Z]/, 'At least one uppercase letter')
    .matches(/\d/, 'At least one number'),

  role: yup
    .string()
    .oneOf(['customer', 'manufacturer', 'creator', 'admin'], 'Role is required')
    .required('Role is required'),
});

const Register: React.FC = () => {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({

    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'customer',
    }
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });



      if (res.data.success && res.data.user) {
        const user = res.data.user;
        Cookies.set('token', res.data.token, { expires: 7 });

        localStorage.setItem('user', JSON.stringify({
          id: user._id || user.id || null,
          name: user.name,
          fullName: user.fullName || user.name, // הוסף שדה fullName
          email: user.email,
          avatar: user.avatar,
          role: user.role

        }));

        dispatch(setUser({
          id: user._id || user.id || null,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || null
        }));

        toast.current?.show({
          severity: 'success',
          summary: 'Registered',
          detail: 'Your account has been created',
          life: 3000
        });

        navigate('/');
      } else {
        throw new Error('User data missing or invalid in response');

      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Registration failed'
      });
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('user');
  //   Cookies.remove('token');
  //   dispatch(setUser({
  //     id: null,
  //     name: '',
  //     email: '',
  //     avatar: null
  //   }));
  //   navigate('/login');
  // };

  useEffect(() => {
    const token = Cookies.get('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setUser(user));
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (user?.id && user?.email) {
      // אם המשתמש כבר מחובר, העבר אותו ל-login
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center mt-10">
      <Toast ref={toast} />
      <Card className="w-full max-w-md">
        <h2 className="text-2xl text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid space-y-4">
          <div>
            <label htmlFor="fullName">Full Name</label>
            <InputText
              id="fullName"
              {...register('fullName')}
              className={errors.fullName ? 'p-invalid w-full' : 'w-full'}
            />
            {errors.fullName && <small className="text-red-500">{errors.fullName.message}</small>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              type="text"
              {...register('email')}
              className={errors.email ? 'p-invalid w-full' : 'w-full'}
              autoComplete="off"
            />
            {errors.email && <small className="text-red-500">{errors.email.message}</small>}
          </div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="password">Password</label>
                <Password
                  id="password"
                  toggleMask
                  feedback={false}
                  {...field}
                  className={classNames({ 'p-invalid': errors.password })}
                />

                {errors.password && <small className="text-red-500">{errors.password.message}</small>}
              </div>
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="role">Role</label>
                <Dropdown
                  id="role"
                  {...field}
                  options={roleOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select a role"
                  className={errors.role ? 'p-invalid w-full' : 'w-full'}
                />
                {errors.role && <small className="text-red-500">{errors.role.message}</small>}
              </div>
            )}
          />

          <Button
            type="submit"
            label="Create Account"
            icon="pi pi-user-plus"
            loading={isSubmitting}
            className="mt-2 w-full"
          />
        </form>
      </Card>
    </div>
  );
};

export default Register;
