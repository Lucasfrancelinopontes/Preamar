import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({ children, className, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={twMerge(
        clsx(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
  </div>
));
Select.displayName = "Select";

export const SelectContent = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={twMerge("", className)} {...props}>
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef(({ children, className, ...props }, ref) => (
  <option
    ref={ref}
    className={twMerge("", className)}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

export const SelectTrigger = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={twMerge("", className)} {...props}>
    {children}
  </div>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = forwardRef(({ placeholder, className, ...props }, ref) => (
  <span ref={ref} className={twMerge("", className)} {...props}>
    {placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";