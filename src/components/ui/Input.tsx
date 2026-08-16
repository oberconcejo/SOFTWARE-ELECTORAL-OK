import React, { forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-300 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all',
            error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-500 ml-1 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
