import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF] border-transparent shadow-sm',
      secondary: 'bg-white text-[#1D4ED8] border-[#1D4ED8] hover:bg-[#F8FAFC]',
      outline: 'bg-transparent text-[#1D4ED8] border-[#1D4ED8] hover:bg-[#1D4ED8]/5',
      ghost: 'bg-transparent text-[#102A43] border-transparent hover:bg-slate-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs font-bold',
      md: 'h-10 px-5 py-2 text-sm font-bold',
      lg: 'h-12 px-8 text-base font-bold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 border',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
