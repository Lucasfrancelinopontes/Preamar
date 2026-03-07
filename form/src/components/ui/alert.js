import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Alert = forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={twMerge(
      clsx(
        "relative w-full rounded-lg border p-4",
        {
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive":
            variant === "destructive",
        },
        className
      )
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

export const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";