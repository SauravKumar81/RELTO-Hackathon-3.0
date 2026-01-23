import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

type FormData = {
  name: string;
  email: string;
  password: string;
};

export const RegisterForm = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.registerUser);
  const loading = useAuthStore((s) => s.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Name" {...register('name', { required: true })} />
      <Input placeholder="Email" {...register('email', { required: true })} />
      <Input
        type="password"
        placeholder="Password"
        {...register('password', { required: true })}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
        {isSubmitting || loading ? 'Registering...' : 'Register'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Login here
        </button>
      </p>
    </form>
  );
};
