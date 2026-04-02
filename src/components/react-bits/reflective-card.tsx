"use client";

import { HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

export function ReflectiveCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const [style, setStyle] = useState({
    background:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.54), rgba(184,158,255,0.18) 42%, rgba(82,39,255,0.06) 72%)",
  });

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_40px_rgba(82,39,255,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1",
        className,
      )}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setStyle({
          background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.7), rgba(184,158,255,0.2) 42%, rgba(82,39,255,0.06) 72%)`,
        });
      }}
      {...props}
    >
      <div className="absolute inset-0 opacity-90 transition duration-300 group-hover:opacity-100" style={style} />
      <div className="relative">{children}</div>
    </div>
  );
}
