import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import { registerUserWithMysql, syncUserWithMysql } from '../services/mysqlService';
import { setActiveUser } from '../utils/auth';
import { UserPlus, LogIn } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  const password = watch('password');

  const onSubmit = async (data) => {
    const toastId = toast.loading('Creating your account...');
    try {
      const emailClean = data.email.trim().toLowerCase();
      const userProfile = await registerUserWithMysql({
        name: data.name.trim(),
        email: emailClean,
        password: data.password
      });

      // Save user session
      setActiveUser(userProfile);
      await syncUserWithMysql(userProfile);

      toast.success(`Welcome, ${userProfile.name}! Account registered successfully.`, { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration error. Please try again.', { id: toastId });
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background glowing gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-800 relative z-10"
      >
        {/* Navigation Tabs between Sign In and Create Account */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-1 tracking-tight">Create an Account</h2>
        <p className="text-center text-slate-400 text-xs sm:text-sm mb-6">Join thousands of users building professional resumes.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name" 
            id="name" 
            placeholder="John Doe"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />

          <Input 
            label="Email Address" 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
            })}
            error={errors.email?.message}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Password" 
              id="password" 
              type="password" 
              placeholder="••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              error={errors.password?.message}
            />

            <Input 
              label="Confirm Password" 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm mt-4"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-indigo-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <LogIn size={13} />
            Sign In Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
