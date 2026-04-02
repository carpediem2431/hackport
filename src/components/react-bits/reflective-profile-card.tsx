"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Activity, Fingerprint, Lock } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 50, y: 50 });
  const filterId = useId();
  const svgFilterId = useMemo(() => filterId.replace(/:/g, "-"), [filterId]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    const videoElement = videoRef.current;

    const startWebcam = async () => {
      if (!("mediaDevices" in navigator) || !navigator.mediaDevices?.getUserMedia) {
        setCameraUnavailable(true);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        if (!videoElement || cancelled) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        videoElement.srcObject = stream;

        const markReady = () => {
          if (!cancelled) {
            setStreamActive(true);
            setCameraUnavailable(false);
          }
        };

        videoElement.onloadedmetadata = () => {
          void videoElement.play().then(markReady).catch(() => {
            markReady();
          });
        };

        if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
          void videoElement.play().then(markReady).catch(() => {
            markReady();
          });
        }
      } catch (error) {
        if (!cancelled) {
          setStreamActive(false);
          setCameraUnavailable(true);
        }
        console.warn("Reflective card webcam unavailable, using gradient fallback.", error);
      }
    };

    startWebcam();

    return () => {
      cancelled = true;

      if (videoElement) {
        videoElement.onloadedmetadata = null;
        videoElement.srcObject = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  useEffect(() => {
    const containerElement = containerRef.current;

    if (!containerElement) {
      return;
    }

    const handlePointerMove = (event: MouseEvent) => {
      const rect = containerElement.getBoundingClientRect();
      setPointerPosition({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };

    const handlePointerLeave = () => {
      setPointerPosition({ x: 50, y: 50 });
    };

    containerElement.addEventListener("mousemove", handlePointerMove);
    containerElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      containerElement.removeEventListener("mousemove", handlePointerMove);
      containerElement.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  const normalizedRoughness = Math.max(0, Math.min(1, roughness));
  const normalizedMetalness = Math.max(0, Math.min(1.5, metalness));
  const baseFrequency = 0.008 / Math.max(0.5, noiseScale);
  const grayscaleAmount = Math.max(0, Math.min(1, grayscale));
  const effectiveDisplacement = displacementStrength * (0.08 + (1 - normalizedRoughness) * 0.1);
  const effectiveGlassDistortion = glassDistortion * (0.03 + (1 - normalizedRoughness) * 0.05);
  const effectiveSpecularConstant = 0.3 + specularConstant * 0.06 * normalizedMetalness;
  const specularExponent = 16 + normalizedMetalness * 6 - normalizedRoughness * 4;
  const erodeRadius = 8 + normalizedMetalness * 2;
  const blurDeviation = 18 - normalizedRoughness * 2;

  const cssVariables = {
    "--blur-strength": `${blurStrength}px`,
    "--metalness": normalizedMetalness,
    "--roughness": normalizedRoughness,
    "--overlay-color": overlayColor,
    "--text-color": color,
    "--grayscale": grayscaleAmount,
    "--pointer-x": `${pointerPosition.x}%`,
    "--pointer-y": `${pointerPosition.y}%`,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
      style={{ ...style, ...cssVariables }}
    >
      <svg className={styles.filters} aria-hidden="true">
        <defs>
          <filter id={svgFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={effectiveDisplacement} xChannelSelector="R" yChannelSelector="G" result="rippled" />
            <feSpecularLighting in="noiseAlpha" surfaceScale={effectiveDisplacement} specularConstant={effectiveSpecularConstant} specularExponent={specularExponent} lightingColor="#ffffff" result="light">
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="solidAlpha" />
            <feMorphology in="solidAlpha" operator="erode" radius={erodeRadius} result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation={blurDeviation} result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap in="metallic-result" in2="glassMap" scale={effectiveGlassDistortion} xChannelSelector="A" yChannelSelector="A" result="final" />
          </filter>
        </defs>
      </svg>

      <div className={styles.effects} style={{ filter: `url(#${svgFilterId})` }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`${styles.video} ${streamActive ? styles.videoVisible : styles.videoHidden}`}
        />
        <div
          className={`${styles.fallback} ${streamActive ? styles.fallbackHidden : ""}`.trim()}
          style={{
            background: cameraUnavailable
              ? "linear-gradient(135deg, #17132b, #3e2780 48%, #8a72ff)"
              : "linear-gradient(135deg, #1d1333, #5227FF 55%, #b19eef)",
          }}
        />

        <div className={styles.noise} />
        <div className={styles.spotlight} />
        <div className={styles.sheen} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.border} />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.securityBadge}>
            <Lock size={14} />
            <span>SECURE ACCESS</span>
          </div>
          <Activity className={styles.statusIcon} size={20} />
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          <div className={styles.identityBlock}>
            <h2 className={styles.userName}>HACKPORT USER</h2>
            <p className={styles.userRole}>PRODUCT BUILDER</p>
          </div>
        </div>

        <div className={styles.divider} />

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
