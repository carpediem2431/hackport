import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
