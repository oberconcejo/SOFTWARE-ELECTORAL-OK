import React from 'react';
import { cn } from '@/src/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  key?: string | number;
}

export function Badge({ children, variant = 'neutral', className, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
