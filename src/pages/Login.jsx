import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import { loginUserWithMysql, syncUserWithMysql } from '../services/mysqlService';
import { setActiveUser } from '../utils/auth';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const toastId = toast.loading('Signing in...');
    try {
      const emailClean = data.email.trim().toLowerCase();
      const userProfile = await loginUserWithMysql({
        email: emailClean,
        password: data.password
      });

      // Persist active session
      setActiveUser(userProfile);
      await syncUserWithMysql(userProfile);

      toast.success(`Welcome back, ${userProfile.name}!`, { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.', { id: toastId });
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background glowing gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-800 relative z-10"
      >
        {/* Navigation Tabs between Sign In and Create Account */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-1 tracking-tight">Welcome Back</h2>
        <p className="text-center text-slate-400 text-xs sm:text-sm mb-6">Sign in to manage your AI resumes & applications.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Email Address" 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500" />
              <span>Remember me</span>
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Password reset instructions sent if account exists.'); }} className="text-indigo-400 hover:text-indigo-300 font-bold">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-emerald-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <UserPlus size={13} />
            Create Account Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
