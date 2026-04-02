"use client";

import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ReflectiveCardProps extends HTMLAttributes<HTMLDivElement> {
  overlayColor?: string;
  blurStrength?: number;
  glassDistortion?: number;
  metalness?: number;
  roughness?: number;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  color?: string;
}

export function ReflectiveCard({
  className,
  children,
  overlayColor = "rgba(255, 255, 255, 0.1)",
  blurStrength = 12,
  glassDistortion = 30,
  metalness = 1,
  roughness = 0.75,
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 5,
  grayscale = 0.15,
  color = "#ffffff",
  style,
  ...props
}: ReflectiveCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const normalizedMetalness = Math.max(0, Math.min(1.5, metalness));
  const normalizedRoughness = Math.max(0, Math.min(1, roughness));

  const surfaceStyle = useMemo(() => {
    const haloOpacity = 0.36 + normalizedMetalness * 0.16;
    const midOpacity = 0.14 - normalizedRoughness * 0.04;
    const edgeOpacity = 0.08 - normalizedRoughness * 0.03;
    const spread = 56 + Math.min(18, displacementStrength * 0.35);

    return {
      background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,${haloOpacity}), rgba(255,255,255,${midOpacity}) 28%, rgba(184,158,255,${edgeOpacity}) ${spread}%, rgba(82,39,255,0.03) 76%, transparent 100%)`,
    };
  }, [displacementStrength, normalizedMetalness, normalizedRoughness, pointer.x, pointer.y]);

  const shellStyle = {
    color,
    backdropFilter: `blur(${blurStrength}px) saturate(${1 + normalizedMetalness * 0.12})`,
    WebkitBackdropFilter: `blur(${blurStrength}px) saturate(${1 + normalizedMetalness * 0.12})`,
    ...style,
  };

  const grainStyle = {
    opacity: 0.12 + (1 - normalizedRoughness) * 0.06,
    backgroundSize: `${Math.max(2.2, 3.2 - noiseScale * 0.45)}px ${Math.max(2.2, 3.2 - noiseScale * 0.45)}px`,
    filter: `grayscale(${grayscale}) blur(${Math.max(0, glassDistortion * 0.02)}px)`,
  };

  const frostStyle = {
    background: `linear-gradient(180deg, rgba(255,255,255,${0.22 - normalizedRoughness * 0.04}), rgba(255,255,255,0.08) 34%, ${overlayColor} 100%)`,
    opacity: 0.68,
  };

  const sheenStyle = {
    opacity: 0.08 + normalizedMetalness * 0.05,
    background: `linear-gradient(120deg, transparent 18%, rgba(255,255,255,${0.18 + specularConstant * 0.015}) 46%, rgba(255,255,255,0.05) 58%, transparent 72%)`,
    transform: `translate3d(${(pointer.x - 50) * 0.08}%, ${(pointer.y - 50) * 0.04}%, 0)`,
  };

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y });
    };

    const handleMouseLeave = () => {
      setPointer({ x: 50, y: 50 });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden rounded-[32px] border border-white/55 bg-white/12 shadow-[0_24px_48px_rgba(16,10,34,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(16,10,34,0.24)]",
        className,
      )}
      style={shellStyle}
      {...props}
    >
      <div className="absolute inset-0 opacity-90 transition duration-300 group-hover:opacity-100" style={surfaceStyle} />
      <div className="absolute inset-0 mix-blend-screen" style={frostStyle} />
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          ...grainStyle,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.92) 0.6px, transparent 0.7px)",
        }}
      />
      <div className="absolute inset-[-20%] mix-blend-screen transition duration-300" style={sheenStyle} />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.34 + normalizedMetalness * 0.06}), inset 0 -1px 0 rgba(255,255,255,0.08)`,
        }}
      />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

export default ReflectiveCard;
