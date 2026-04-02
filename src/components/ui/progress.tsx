import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-brand-soft/60", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand via-indigo to-brand-soft-2 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
