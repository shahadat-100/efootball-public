import React from 'react';
import { cn } from '../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-primary to-red-700 text-primary-foreground hover:from-primary/90 hover:to-red-700/90 shadow-sm hover:shadow-glow-red hover:-translate-y-0.5",
      secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
      ghost: "bg-transparent text-primary hover:bg-muted/50",
      danger: "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:from-destructive/90 hover:to-red-600/90",
    };
    const sizes = {
      sm: "h-8 px-3 text-[11px]",
      md: "h-9 px-4 text-[13px]",
      lg: "h-10 px-8 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 gap-1.5",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
