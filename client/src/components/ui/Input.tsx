import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:bg-white/10 placeholder:text-gray-500 transition-all',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
