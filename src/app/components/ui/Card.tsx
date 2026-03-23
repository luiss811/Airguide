import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "bg-white rounded-lg shadow-md border border-gray-200",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("p-6 border-b border-gray-200", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx("p-6", className)} {...props} />
    );
  }
);

CardContent.displayName = "CardContent";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={clsx("font-semibold text-gray-900", className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";
