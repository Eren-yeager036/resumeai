import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, icon: Icon, error, type = 'text', className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-indigo-400 shrink-0" />}
          <span>{label}</span>
        </label>
      )}
      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none 
            bg-slate-950 text-white placeholder-slate-500 border border-slate-800 
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 shadow-inner
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500' : ''}
          `}
          style={{ color: '#ffffff', backgroundColor: '#020617' }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-white focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-rose-400 font-semibold mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
