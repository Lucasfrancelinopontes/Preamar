import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default',
  className, 
  disabled = false,
  ...props 
}) {
  const baseStyles = clsx(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium transition-all duration-200',
    'outline-none focus-visible:ring-[3px]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0'
  );

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 dark:hover:bg-primary/80',
    destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/50 dark:bg-destructive/60 dark:hover:bg-destructive/70',
    outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/50',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 dark:hover:bg-accent/50',
    link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-ring/50',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent/50 dark:text-foreground',
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 has-[>svg]:px-2.5 gap-1.5 rounded-md text-xs',
    lg: 'h-10 px-6 has-[>svg]:px-4 rounded-md',
    icon: 'size-9 rounded-md p-0',
  };

  const classNameMerged = twMerge(
    baseStyles,
    variants[variant] || variants.default,
    sizes[size] || sizes.default,
    'active:scale-95',
    className
  );

  return (
    <button
      className={classNameMerged}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
