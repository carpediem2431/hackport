import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className={cn("mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-strong", eyebrowClassName)}>{eyebrow}</p>
        ) : null}
        <h2 className={cn("font-display text-3xl font-semibold tracking-tight sm:text-4xl", titleClassName)}>{title}</h2>
        {description ? (
          <p className={cn("mt-3 text-pretty text-base leading-7 text-muted", descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
