"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Fingerprint, Lock, User } from "lucide-react";
import styles from "@/components/react-bits/reflective-profile-card.module.css";

interface ReflectiveCardProps {
  blurStrength?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  overlayColor?: string;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  glassDistortion?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ReflectiveProfileCard({
  blurStrength = 12,
  color = "white",
  metalness = 1,
  roughness = 0.4,
  overlayColor = "rgba(255, 255, 255, 0.1)",
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = "",
  style = {},
}: ReflectiveCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
  const saturation = 1 - Math.max(0, Math.min(1, grayscale));

  const cssVariables = {
    "--blur-strength": `${blurStrength}px`,
    "--metalness": metalness,
    "--roughness": roughness,
    "--overlay-color": overlayColor,
    "--text-color": color,
    "--saturation": saturation,
  } as React.CSSProperties;

  return (
    <div className={`${styles.container} ${className}`.trim()} style={{ ...style, ...cssVariables }}>
      <svg className={styles.filters} aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={displacementStrength} xChannelSelector="R" yChannelSelector="G" result="rippled" />
            <feSpecularLighting in="noiseAlpha" surfaceScale={displacementStrength} specularConstant={specularConstant} specularExponent="20" lightingColor="#ffffff" result="light">
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="solidAlpha" />
            <feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap in="metallic-result" in2="glassMap" scale={glassDistortion} xChannelSelector="A" yChannelSelector="A" result="final" />
          </filter>
        </defs>
      </svg>

      {streamActive ? (
        <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
      ) : (
        <div className={styles.video} style={{ background: "linear-gradient(135deg, #1d1333, #5227FF 55%, #b19eef)" }} />
      )}

      <div className={styles.noise} />
      <div className={styles.sheen} />
      <div className={styles.overlay} />
      <div className={styles.border} />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.securityBadge}>
            <Lock size={14} />
            <span>SECURE ACCESS</span>
          </div>
          <Activity className={styles.statusIcon} size={20} />
        </div>

        <div className={styles.body}>
          <div>
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16">
              <User size={22} />
            </div>
            <h2 className={styles.userName}>HACKPORT USER</h2>
            <p className={styles.userRole}>PRODUCT BUILDER · DUMMY LOGIN PROFILE</p>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.label}>Preferred Stack</span>
              <span className={styles.value}>Next.js, TypeScript, OpenAI</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.label}>Team Style</span>
              <span className={styles.value}>Fast Feedback</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            <span className={styles.label}>ID Number</span>
            <span className={styles.value}>HP-2026-0007</span>
          </div>
          <div className={styles.fingerprint}>
            <Fingerprint size={30} />
          </div>
        </div>
      </div>
    </div>
  );
}
