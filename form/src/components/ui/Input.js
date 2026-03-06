import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ 
  label, 
  error, 
  className, 
  id,
  helperText,
  ...props 
}, ref) => {
  const baseStyles = clsx(
    'w-full rounded-md transition-all duration-200',
    'border px-4 py-2 text-base',
    'bg-input-background text-foreground',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    'outline-none'
  );

  const errorStyles = error
    ? 'border-destructive focus-visible:ring-destructive/50'
    : 'border-input';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id || props.name} 
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id || props.name}
        className={twMerge(
          baseStyles,
          errorStyles,
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// maintain backwards compatibility with default imports
export default Input;
