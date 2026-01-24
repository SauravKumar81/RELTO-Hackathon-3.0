import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from './cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 [&>option]:bg-gray-900 [&>option]:text-white',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

