import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand px-5 py-3 text-white shadow-[0_14px_28px_rgba(82,39,255,0.24)] hover:bg-brand-strong",
        secondary: "border border-border bg-surface-strong px-5 py-3 text-foreground hover:bg-white",
        outline: "border border-foreground/16 bg-transparent px-5 py-3 text-foreground hover:border-foreground/28 hover:bg-white/60",
        ghost: "px-4 py-2.5 text-foreground/88 hover:bg-white/70",
        danger: "bg-danger px-5 py-3 text-white hover:opacity-90",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
