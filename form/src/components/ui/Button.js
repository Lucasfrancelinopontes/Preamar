import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}) {
  const variants = {
    primary: 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20 border-0 dark:shadow-brand/40 active:scale-95',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 active:scale-95',
    outline: 'bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white dark:border-brand dark:text-brand dark:hover:bg-brand dark:hover:text-white active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 border-0 active:scale-95',
    accent: 'bg-accent text-dark hover:bg-accent-dark shadow-lg shadow-accent/20 border-0 dark:text-gray-900 active:scale-95',
  };

  return (
    <button
      className={twMerge(
        'px-6 py-3 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
