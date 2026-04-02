import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-white/86 px-3 py-1 text-xs font-medium text-foreground/88 shadow-[0_6px_20px_rgba(82,39,255,0.05)]",
        className,
      )}
      {...props}
    />
  );
}
