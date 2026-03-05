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
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id || props.name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id || props.name}
        className={twMerge(
          'w-full px-4 py-3 rounded-md shadow-sm transition-all duration-200',
          'bg-white dark:bg-dark-surface',
          'text-gray-900 dark:text-white',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed',
          error 
            ? 'border-2 border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border border-gray-300 dark:border-slate-600 focus:border-brand focus:ring-4 focus:ring-brand/20',
          'focus:outline-none',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
