import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:bg-white/10 placeholder:text-gray-500 transition-all resize-none',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
