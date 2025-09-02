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
import { RadioButton } from 'primereact/radiobutton';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/user/slices/userSlice';
import Cookies from 'js-cookie';
import type { RootState } from '../store';

const schema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[A-Za-z\u0590-\u05FF\s]+$/, 'First name must contain only letters (Hebrew or English)'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[A-Za-z\u0590-\u05FF\s]+$/, 'Last name must contain only letters (Hebrew or English)'),
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
    .oneOf(['customer', 'manufacturer', 'creator'] as const, 'Role is required')
    .required('Role is required'),
  companyName: yup.string().optional(),
}).required();

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'manufacturer' | 'creator';
  companyName?: string;
};

const Register: React.FC = () => {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'customer' as const,
      companyName: '',
    }
  });

  const watchedRole = watch('role');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: data.role,
        companyName: data.companyName,
      });

      if (res.data.success && res.data.user) {
        const user = res.data.user;
        Cookies.set('token', res.data.token, { expires: 7 });

        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          avatar: user.avatar || null,
          fullName: user.fullName || user.name, 
          email: user.email,
          role: user.role,
        }));

        dispatch(setUser({
          id: user._id || user.id || null,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || null
        }));

        // Register user to Socket.IO
        import('../services/socket').then(({ default: socket }) => {
          import('../constants/socketEvents').then(({ socket_events }) => {
            socket.emit(socket_events.register_user, {
              userId: user._id || user.id,
              role: user.role
            });
          });
        });

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
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toast ref={toast} />
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First Name */}
          <div>
            <InputText
              id="firstName"
              {...register('firstName')}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : ''
              }`}
              placeholder="First Name"
            />
            {errors.firstName && <small className="text-red-500 text-sm">{errors.firstName.message}</small>}
          </div>

          {/* Last Name */}
          <div>
            <InputText
              id="lastName"
              {...register('lastName')}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : ''
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && <small className="text-red-500 text-sm">{errors.lastName.message}</small>}
          </div>

          {/* Email */}
          <div>
            <InputText
              id="email"
              type="email"
              {...register('email')}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : ''
              }`}
              placeholder="Email"
              autoComplete="off"
            />
            {errors.email && <small className="text-red-500 text-sm">{errors.email.message}</small>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">Role</label>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <RadioButton
                  inputId="customer"
                  name="role"
                  value="customer"
                  onChange={(e) => setValue('role', e.value)}
                  checked={watchedRole === 'customer'}
                  className="mr-2"
                />
                <label htmlFor="customer" className="text-gray-700 text-sm">Customer</label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="creator"
                  name="role"
                  value="creator"
                  onChange={(e) => setValue('role', e.value)}
                  checked={watchedRole === 'creator'}
                  className="mr-2"
                />
                <label htmlFor="creator" className="text-gray-700 text-sm">Creator</label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="manufacturer"
                  name="role"
                  value="manufacturer"
                  onChange={(e) => setValue('role', e.value)}
                  checked={watchedRole === 'manufacturer'}
                  className="mr-2"
                />
                <label htmlFor="manufacturer" className="text-gray-700 text-sm">Manufacturer</label>
              </div>
            </div>
            {errors.role && <small className="text-red-500 text-sm">{errors.role.message}</small>}
          </div>

          {/* Password */}
          <div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Password
                  id="password"
                  toggleMask
                  feedback={false}
                  value={field.value}
                  onChange={field.onChange}
                  className={`w-full ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  inputClassName="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                  style={{ width: '100%' }}
                />
              )}
            />
            {errors.password && <small className="text-red-500 text-sm">{errors.password.message}</small>}
          </div>

          {/* Company Name (Optional) */}
          <div>
            <InputText
              id="companyName"
              {...register('companyName')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Company Name (optional)"
            />
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            label="Sign Up"
            loading={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
