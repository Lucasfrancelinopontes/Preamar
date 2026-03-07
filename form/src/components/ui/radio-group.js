import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const RadioGroup = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="radio"
    className={twMerge(
      clsx(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )
    )}
    {...props}
  />
));
RadioGroupItem.displayName = "RadioGroupItem";