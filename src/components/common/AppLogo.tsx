import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
export type LogoVariant = 'brand' | 'indigo' | 'purple' | 'emerald' | 'cyan' | 'admin';

export interface AppLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  animated?: boolean;
  floating?: boolean;
  withText?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  showGlowHalo?: boolean;
}

const sizeConfig: Record<LogoSize, {
  container: string;
  icon: string;
  borderRadius: string;
  glowBlur: string;
  titleSize: string;
  subtitleSize: string;
}> = {
  xs: {
    container: 'w-7 h-7',
    icon: 'w-4 h-4',
    borderRadius: 'rounded-lg',
    glowBlur: 'blur-sm',
    titleSize: 'text-xs',
    subtitleSize: 'text-[9px]',
  },
  sm: {
    container: 'w-9 h-9',
    icon: 'w-5 h-5',
    borderRadius: 'rounded-xl',
    glowBlur: 'blur-md',
    titleSize: 'text-sm',
    subtitleSize: 'text-[10px]',
  },
  md: {
    container: 'w-11 h-11',
    icon: 'w-6 h-6',
    borderRadius: 'rounded-xl',
    glowBlur: 'blur-lg',
    titleSize: 'text-base',
    subtitleSize: 'text-xs',
  },
  lg: {
    container: 'w-14 h-14',
    icon: 'w-8 h-8',
    borderRadius: 'rounded-2xl',
    glowBlur: 'blur-xl',
    titleSize: 'text-lg',
    subtitleSize: 'text-xs',
  },
  xl: {
    container: 'w-20 h-20',
    icon: 'w-11 h-11',
    borderRadius: 'rounded-3xl',
    glowBlur: 'blur-2xl',
    titleSize: 'text-2xl',
    subtitleSize: 'text-sm',
  },
  '2xl': {
    container: 'w-28 h-28',
    icon: 'w-16 h-16',
    borderRadius: 'rounded-3xl',
    glowBlur: 'blur-3xl',
    titleSize: 'text-3xl',
    subtitleSize: 'text-base',
  },
  hero: {
    container: 'w-36 h-36 md:w-44 md:h-44',
    icon: 'w-20 h-20 md:w-24 md:h-24',
    borderRadius: 'rounded-[32px] md:rounded-[40px]',
    glowBlur: 'blur-3xl',
    titleSize: 'text-4xl',
    subtitleSize: 'text-lg',
  },
};

const variantColorMap: Record<LogoVariant, {
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  accentText: string;
  shadowClass: string;
  neonStroke: string;
  haloBg: string;
}> = {
  brand: {
    borderColor: 'border-purple-500/85 hover:border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    bgGradient: 'from-[#0b0714] via-[#120a22] to-[#0d0718]',
    accentText: 'bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent',
    shadowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.55),inset_0_0_12px_rgba(168,85,247,0.22)]',
    neonStroke: '#a855f7',
    haloBg: 'bg-purple-600/35',
  },
  indigo: {
    borderColor: 'border-indigo-500/80 hover:border-indigo-400',
    glowColor: 'rgba(99, 102, 241, 0.7)',
    bgGradient: 'from-slate-950 via-[#070b19] to-[#0d142b]',
    accentText: 'text-indigo-400',
    shadowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.5),inset_0_0_15px_rgba(99,102,241,0.25)]',
    neonStroke: '#6366f1',
    haloBg: 'bg-indigo-500/30',
  },
  purple: {
    borderColor: 'border-purple-500/85 hover:border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    bgGradient: 'from-[#0b0714] via-[#120a22] to-[#0d0718]',
    accentText: 'text-purple-400',
    shadowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.55),inset_0_0_12px_rgba(168,85,247,0.22)]',
    neonStroke: '#a855f7',
    haloBg: 'bg-purple-600/35',
  },
  emerald: {
    borderColor: 'border-emerald-500/80 hover:border-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    bgGradient: 'from-slate-950 via-[#041712] to-[#08241b]',
    accentText: 'text-emerald-400',
    shadowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.5),inset_0_0_15px_rgba(16,185,129,0.25)]',
    neonStroke: '#10b981',
    haloBg: 'bg-emerald-500/30',
  },
  cyan: {
    borderColor: 'border-cyan-400/80 hover:border-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    bgGradient: 'from-slate-950 via-[#03151f] to-[#062030]',
    accentText: 'text-cyan-400',
    shadowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.5),inset_0_0_15px_rgba(6,182,212,0.25)]',
    neonStroke: '#06b6d4',
    haloBg: 'bg-cyan-500/30',
  },
  admin: {
    borderColor: 'border-purple-500/85 hover:border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    bgGradient: 'from-[#0b0714] via-[#120a22] to-[#0d0718]',
    accentText: 'text-purple-400',
    shadowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.55),inset_0_0_12px_rgba(168,85,247,0.22)]',
    neonStroke: '#a855f7',
    haloBg: 'bg-purple-600/35',
  },
};

/**
 * Modern High-Tech Vector Electoral Icon with crisp, sharp elements
 */
function ElectoralIconSvg({ variant, className }: { variant: LogoVariant; className?: string }) {
  const gradientId = `logo-electoral-grad-${variant}`;

  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Main Linear Gradient adapted to software colors */}
        <linearGradient id={gradientId} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          {variant === 'brand' && (
            <>
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </>
          )}
          {variant === 'indigo' && (
            <>
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </>
          )}
          {variant === 'purple' && (
            <>
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </>
          )}
          {variant === 'emerald' && (
            <>
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </>
          )}
          {variant === 'cyan' && (
            <>
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </>
          )}
          {variant === 'admin' && (
            <>
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* Outer Geometric Frame / Ballot Urn Silhouette */}
      <rect
        x="9"
        y="13"
        width="30"
        height="26"
        rx="7"
        fill="currentColor"
        fillOpacity="0.12"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top Ballot Slot with Inset */}
      <path
        d="M17 19.5H31"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Central Interactive Electoral Seal / Check & Power Circle */}
      <circle
        cx="24"
        cy="29"
        r="6.5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.8"
      />

      {/* Smart Democratic Victory Checkmark - High Contrast & Sharp */}
      <path
        d="M21.2 29L23.2 31L27 27"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radiant Top Spark / Digital Intelligence Diamond */}
      <path
        d="M24 7L25.2 9.8L28 11L25.2 12.2L24 15L22.8 12.2L20 11L22.8 9.8L24 7Z"
        fill={`url(#${gradientId})`}
      />

      {/* Tech Corner Accents */}
      <circle cx="13.5" cy="17.5" r="1.1" fill={`url(#${gradientId})`} />
      <circle cx="34.5" cy="17.5" r="1.1" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function AppLogo({
  size = 'md',
  variant = 'brand',
  animated = true,
  floating = false, // Default to static stable placement
  withText = false,
  title = 'SOFTWARE',
  subtitle,
  className,
  onClick,
  showGlowHalo = true,
}: AppLogoProps) {
  const config = sizeConfig[size];
  const color = variantColorMap[variant];

  // Subtle, calm ambient glow halo animation (3.6s cycle, no sudden jumps, no spinning/floating)
  const haloAnimation = animated ? {
    opacity: [0.3, 0.55, 0.3],
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
    }
  } : {};

  const LogoContainer = (
    <div 
      className="relative flex items-center justify-center select-none group"
    >
      {/* Ambient Pulsing Halo Glow behind the badge (Slow & Discreet) */}
      {showGlowHalo && (
        <motion.div 
          animate={haloAnimation}
          className={cn(
            "absolute -inset-1 rounded-2xl pointer-events-none transition-opacity duration-300",
            config.glowBlur,
            color.haloBg,
            "motion-reduce:animate-none motion-reduce:opacity-40"
          )}
        />
      )}

      {/* Main Squircle Badge with Glowing Neon Border */}
      <div
        className={cn(
          "relative flex items-center justify-center border backdrop-blur-xl transition-all duration-200 ease-out",
          "hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none",
          config.container,
          config.borderRadius,
          color.borderColor,
          color.bgGradient,
          color.shadowClass,
          "bg-gradient-to-br"
        )}
        style={{
          boxShadow: `0 0 16px ${color.glowColor}, inset 0 0 10px ${color.glowColor.replace(/[\d.]+\)$/, '0.15)')}`
        }}
      >
        {/* Subtle Glass Surface Reflection Line */}
        <div className="absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full pointer-events-none" />

        {/* Center Sharp, Completely Stable Electoral Emblem */}
        <div className={cn("flex items-center justify-center relative z-10", config.icon)}>
          <ElectoralIconSvg variant={variant} />
        </div>
      </div>
    </div>
  );

  if (!withText) {
    return (
      <div 
        id="app-logo-badge"
        onClick={onClick} 
        className={cn("inline-flex items-center justify-center", onClick && "cursor-pointer", className)}
      >
        {LogoContainer}
      </div>
    );
  }

  return (
    <div 
      id="app-logo-with-brand"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 select-none", 
        onClick && "cursor-pointer group", 
        className
      )}
    >
      {LogoContainer}
      
      <div className="flex flex-col min-w-0">
        <div className={cn("font-black tracking-tight leading-none flex items-center gap-1.5", config.titleSize)}>
          <span className="text-white drop-shadow-sm">{title}</span>
          <span className={cn(color.accentText, "font-extrabold")}>
            ELECTORAL
          </span>
        </div>
        {subtitle && (
          <span className={cn("text-slate-400 font-medium tracking-wide mt-0.5 truncate", config.subtitleSize)}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default AppLogo;
