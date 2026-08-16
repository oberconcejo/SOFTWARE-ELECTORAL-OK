import { cn } from '@/src/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showValue, 
  color = 'indigo', 
  size = 'md',
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  const trackColors = {
    indigo: 'bg-indigo-500/10',
    emerald: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10',
    purple: 'bg-purple-500/10',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          {showValue && <span className="text-white font-bold">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', trackColors[color], sizes[size])}>
        <div 
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
