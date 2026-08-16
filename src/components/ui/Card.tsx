import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, headerAction, icon: Icon, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white/5 border border-white/10 rounded-3xl overflow-hidden', className)}
      {...props}
    >
      {(title || subtitle || headerAction || Icon) && (
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-indigo-400" />}
            <div>
              {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};
