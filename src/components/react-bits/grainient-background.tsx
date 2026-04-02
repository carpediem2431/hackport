import { cn } from "@/lib/utils";

export function GrainientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(184,158,255,0.98),_transparent_34%),radial-gradient(circle_at_82%_14%,_rgba(82,39,255,0.88),_transparent_30%),radial-gradient(circle_at_76%_72%,_rgba(177,158,239,0.88),_transparent_32%),radial-gradient(circle_at_16%_82%,_rgba(82,39,255,0.82),_transparent_28%),linear-gradient(135deg,_#b89eff_0%,_#B19EEF_42%,_#5227FF_100%)]" />
      <div className="absolute inset-0 opacity-45 mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,0.9)_0.8px,transparent_0.8px)] [background-size:2px_2px]" />
      <div className="absolute inset-[-8%] opacity-35 mix-blend-soft-light blur-[2px] [background:linear-gradient(135deg,rgba(255,255,255,0.7),transparent_28%,rgba(255,255,255,0.5)_48%,transparent_64%,rgba(255,255,255,0.55))] animate-[grain-shift_18s_linear_infinite_alternate]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_36%,rgba(82,39,255,0.1)_100%)]" />
    </div>
  );
}
