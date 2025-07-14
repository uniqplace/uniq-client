import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';


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
});


const Register: React.FC = () => {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: ''
    }
  });


  const onSubmit = async (data: any) => {
    try {
      const res = await axios.post('api/auth/register', {
        name: data.fullName,
        email: data.email,
        password: data.password
      });

      if (res.data.success) {
        const user = res.data.user; 
        localStorage.setItem('user', JSON.stringify({
          fullName: user.name, 
          email: user.email,
          avatar: user.avatar,
        }));
        toast.current?.show({
          severity: 'success',
          summary: 'Registered',
          detail: 'Your account has been created',
          life: 3000
        });
        navigate('/');
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Registration failed'
      });
    }
  };

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
            {errors.fullName && (
              <small className="text-red-500">{errors.fullName.message}</small>
            )}
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
            {errors.email && (
              <small className="text-red-500">{errors.email.message}</small>
            )}
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
                {errors.password && (
                  <small className="text-red-500">{errors.password.message}</small>
                )}
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
