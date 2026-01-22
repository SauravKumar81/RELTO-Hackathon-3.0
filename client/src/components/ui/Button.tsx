import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center chamfered-btn transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        size === 'icon' && 'p-2',
        variant === 'primary' &&
          'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
        variant === 'secondary' &&
          'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md',
        variant === 'ghost' &&
          'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white',
        variant === 'outline' &&
          'bg-transparent border border-white/20 text-gray-300 hover:border-white/40 hover:text-white',
        className
      )}
      {...props}
    />
  );
};
