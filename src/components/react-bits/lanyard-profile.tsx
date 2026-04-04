"use client";

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  type RapierRigidBody,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import styles from "@/components/react-bits/lanyard-profile.module.css";

interface LanyardProfileProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  cardImage?: string | null;
  profileImage?: string | null;
  user?: {
    nickname: string;
    role: string;
    level: string;
    email: string;
  } | null;
}

type RigidBodyWithLerp = RapierRigidBody & { lerped?: THREE.Vector3 };

export default function LanyardProfile({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  cardImage = null,
  profileImage = null,
  user = null,
}: LanyardProfileProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Canvas
        className={styles.canvas}
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band cardImage={cardImage} isMobile={isMobile} profileImage={profileImage} user={user} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function createLanyardTextureSync() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  context.fillStyle = "#d8ceff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#5227FF";
  context.lineWidth = 10;

  for (let i = -64; i < canvas.width + 64; i += 54) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + 36, canvas.height);
    context.stroke();
  }

  context.fillStyle = "#ffffff";
  context.font = "bold 18px Arial";
  context.fillText("HACKPORT", 24, 38);
  context.fillText("HACKPORT", 188, 38);
  context.fillText("HACKPORT", 352, 38);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createLanyardTextureFromImage(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  context.save();
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (canvas.width - drawWidth) / 2;
  const offsetY = (canvas.height - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  context.restore();

  context.fillStyle = "rgba(82, 39, 255, 0.45)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ffffff";
  context.font = "bold 18px Arial";
  context.fillText("HACKPORT", 24, 38);
  context.fillText("HACKPORT", 188, 38);
  context.fillText("HACKPORT", 352, 38);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const nextRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
}

function loadBadgeImage(src: string | null) {
  if (!src) {
    return Promise.resolve<HTMLImageElement | null>(null);
  }

  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function createBadgeTexture({
  image,
  user,
  side,
}: {
  image: HTMLImageElement | null;
  user: {
    nickname: string;
    role: string;
    level: string;
    email: string;
  } | null;
  side: "front" | "back";
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1280;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  const cardX = 46;
  const cardY = 46;
  const cardWidth = canvas.width - 92;
  const cardHeight = canvas.height - 92;
  const cardRadius = 54;
  const innerX = 78;
  const innerY = 78;
  const innerWidth = canvas.width - 156;
  const innerHeight = canvas.height - 156;
  const innerRadius = 42;
  const labelColor = "rgba(38,38,38,0.72)";
  const primaryColor = "rgba(18,18,18,0.96)";
  const secondaryColor = "rgba(34,34,34,0.78)";
  const dividerColor = "rgba(255,255,255,0.36)";

  const drawBackgroundImage = () => {
    if (image) {
      context.save();
      createRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
      context.clip();
      context.fillStyle = "#ebe7e0";
      context.fillRect(cardX, cardY, cardWidth, cardHeight);
      context.filter = "saturate(0.82) contrast(1.04) brightness(1.14) blur(16px)";
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      const scale = Math.max(cardWidth / image.width, cardHeight / image.height) * 1.26;
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = canvas.width - (cardX + (cardWidth - drawWidth) / 2);
      const offsetY = cardY + (cardHeight - drawHeight) / 2;
      context.drawImage(image, offsetX - drawWidth, offsetY, drawWidth, drawHeight);
      context.restore();
      context.filter = "none";

      const haze = context.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
      haze.addColorStop(0, "rgba(255,255,255,0.84)");
      haze.addColorStop(0.18, "rgba(255,255,255,0.72)");
      haze.addColorStop(0.55, "rgba(255,255,255,0.18)");
      haze.addColorStop(1, "rgba(255,255,255,0.28)");
      context.fillStyle = haze;
      createRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
      context.fill();
      return;
    }

    const fallback = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    fallback.addColorStop(0, "#f3f0eb");
    fallback.addColorStop(0.55, "#ece7de");
    fallback.addColorStop(1, "#dfd8cc");
    context.fillStyle = fallback;
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawNoiseOverlay = () => {
    context.save();
    context.globalCompositeOperation = "overlay";
    for (let i = 0; i < 2200; i += 1) {
      const x = (i * 37) % canvas.width;
      const y = (i * 61) % canvas.height;
      const alpha = ((i % 7) + 1) / 180;
      context.fillStyle = `rgba(120,110,90,${alpha})`;
      context.fillRect(x, y, 2, 2);
    }
    context.restore();
  };

  const drawGlassCardShell = () => {
    context.fillStyle = "rgba(255,255,255,0.14)";
    createRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.08)";
    createRoundedRectPath(context, innerX, innerY, innerWidth, innerHeight, innerRadius);
    context.fill();

    context.save();
    context.globalCompositeOperation = "overlay";
    const sheen = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
    sheen.addColorStop(0, "rgba(255,255,255,0.62)");
    sheen.addColorStop(0.26, "rgba(255,255,255,0.24)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(0.72, "rgba(255,255,255,0.12)");
    sheen.addColorStop(1, "rgba(255,255,255,0.3)");
    context.fillStyle = sheen;
    createRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
    context.fill();
    context.restore();

    const border = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
    border.addColorStop(0, "rgba(255,255,255,0.9)");
    border.addColorStop(0.5, "rgba(255,255,255,0.32)");
    border.addColorStop(1, "rgba(255,255,255,0.72)");
    context.strokeStyle = border;
    context.lineWidth = 2;
    createRoundedRectPath(context, cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2, cardRadius - 1);
    context.stroke();
  };

  const drawSecurityBadge = () => {
    context.fillStyle = "rgba(255,255,255,0.18)";
    createRoundedRectPath(context, 106, 118, 236, 66, 18);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.28)";
    context.lineWidth = 1.5;
    createRoundedRectPath(context, 106, 118, 236, 66, 18);
    context.stroke();

    context.save();
    context.translate(144, 151);
    context.strokeStyle = primaryColor;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.beginPath();
    context.arc(0, -7, 10, Math.PI, 0);
    context.stroke();
    context.strokeRect(-12, -6, 24, 22);
    context.restore();

    context.fillStyle = primaryColor;
    context.font = "700 22px Inter, Arial, sans-serif";
    context.fillText("보안 접근", 180, 132);
  };

  const drawPulseMark = () => {
    context.save();
    context.translate(720, 144);
    context.strokeStyle = primaryColor;
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, 12);
    context.lineTo(12, 12);
    context.lineTo(22, -6);
    context.lineTo(36, 28);
    context.lineTo(48, 8);
    context.lineTo(62, 8);
    context.stroke();
    context.restore();
  };

  const drawFingerprint = (centerX: number, centerY: number, scale = 1) => {
    context.save();
    context.translate(centerX, centerY);
    context.strokeStyle = "rgba(80,80,80,0.5)";
    context.lineWidth = 3 * scale;
    [[24, 34], [18, 28], [12, 22], [6, 14]].forEach(([rx, ry], index) => {
      context.beginPath();
      context.ellipse(0, 0, rx * scale, ry * scale, 0, Math.PI * (0.2 + index * 0.03), Math.PI * (1.78 - index * 0.03));
      context.stroke();
    });
    context.restore();
  };

  context.textBaseline = "top";
  drawBackgroundImage();
  drawNoiseOverlay();
  drawGlassCardShell();
  drawSecurityBadge();
  drawPulseMark();

  context.strokeStyle = dividerColor;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(110, 206);
  context.lineTo(790, 206);
  context.stroke();

  if (side === "front") {
    context.fillStyle = primaryColor;
    context.textAlign = "center";
    context.font = "700 72px Inter, Arial, sans-serif";
    context.fillText(user?.nickname ?? "HackPort User", canvas.width / 2, 818);

    context.font = "500 28px Inter, Arial, sans-serif";
    context.fillStyle = secondaryColor;
    context.fillText(user?.role ?? "Product Builder", canvas.width / 2, 914);
    context.textAlign = "start";
  } else {
    context.fillStyle = "rgba(255,255,255,0.15)";
    createRoundedRectPath(context, 104, 248, 692, 180, 30);
    context.fill();
    context.fillStyle = primaryColor;
    context.font = "700 46px Inter, Arial, sans-serif";
    context.fillText(user?.nickname ?? "HackPort User", 138, 282);
    context.font = "500 22px Inter, Arial, sans-serif";
    context.fillStyle = secondaryColor;
    context.fillText(user?.role ?? "Product Builder", 140, 350);

    const rows = [
      ["LEVEL", user?.level ?? "Intermediate"],
      ["EMAIL", user?.email ?? "hello@hackport.dev"],
      ["STATUS", "Verified for hackathon entry"],
    ] as const;

    let rowTop = 532;
    rows.forEach(([label, value]) => {
      context.fillStyle = "rgba(255,255,255,0.18)";
      createRoundedRectPath(context, 104, rowTop, 692, 136, 28);
      context.fill();
      context.fillStyle = labelColor;
      context.font = "700 18px Inter, Arial, sans-serif";
      context.fillText(label, 136, rowTop + 24);
      context.fillStyle = primaryColor;
      context.font = label === "EMAIL" ? "600 24px Menlo, Monaco, monospace" : "700 34px Inter, Arial, sans-serif";
      context.fillText(value, 136, rowTop + 62);
      rowTop += 164;
    });
  }

  context.beginPath();
  context.moveTo(110, 1090);
  context.lineTo(790, 1090);
  context.stroke();

  context.fillStyle = labelColor;
  context.font = "700 16px Inter, Arial, sans-serif";
  context.fillText("이메일", 112, 1126);
  context.fillStyle = primaryColor;
  context.font = "500 26px Menlo, Monaco, monospace";
  context.fillText(user?.email ?? "hello@hackport.dev", 112, 1154);
  drawFingerprint(748, 1168, 1.05);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function createCapturedCardTexture(image: HTMLImageElement) {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  cardImage = null,
  isMobile = false,
  profileImage = null,
  user = null,
}: {
  maxSpeed?: number;
  minSpeed?: number;
  cardImage?: string | null;
  isMobile?: boolean;
  profileImage?: string | null;
  user?: {
    nickname: string;
    role: string;
    level: string;
    email: string;
  } | null;
}) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  const bandTextureRef = useRef<THREE.Texture | null>(null);
  const frontTextureRef = useRef<THREE.Texture | null>(null);
  const backTextureRef = useRef<THREE.Texture | null>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const userEmail = user?.email ?? null;
  const userLevel = user?.level ?? null;
  const userNickname = user?.nickname ?? null;
  const userRole = user?.role ?? null;
  const badgeUser = useMemo(
    () => (userNickname && userRole && userLevel && userEmail
      ? {
          email: userEmail,
          level: userLevel,
          nickname: userNickname,
          role: userRole,
        }
      : null),
    [userEmail, userLevel, userNickname, userRole],
  );

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const [bandTexture, setBandTexture] = useState<THREE.Texture>(() => createLanyardTextureSync());

  useEffect(() => {
    bandTextureRef.current = bandTexture;
  }, [bandTexture]);

  useEffect(() => {
    let cancelled = false;

    const loadBandTexture = async () => {
      if (!profileImage) {
        setBandTexture((prev) => {
          const nextTexture = createLanyardTextureSync();
          prev.dispose();
          return nextTexture;
        });
        return;
      }

      const image = await loadBadgeImage(profileImage);
      if (cancelled || !image) return;

      const nextTexture = createLanyardTextureFromImage(image);
      setBandTexture((prev) => {
        prev.dispose();
        return nextTexture;
      });
    };

    void loadBandTexture();

    return () => {
      cancelled = true;
    };
  }, [profileImage]);

  const curve = useMemo(() => {
    const nextCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    nextCurve.curveType = "chordal";
    return nextCurve;
  }, []);
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const [frontTexture, setFrontTexture] = useState<THREE.Texture>(() => createBadgeTexture({ image: null, user: badgeUser, side: "front" }));
  const [backTexture, setBackTexture] = useState<THREE.Texture>(() => createBadgeTexture({ image: null, user: badgeUser, side: "back" }));

  useEffect(() => {
    frontTextureRef.current = frontTexture;
  }, [frontTexture]);

  useEffect(() => {
    backTextureRef.current = backTexture;
  }, [backTexture]);

  const lineGeometry = useMemo(() => new MeshLineGeometry(), []);
  const lineMaterial = useMemo(
    () => {
      const material = new MeshLineMaterial({
        color: "#ffffff",
        resolution: new THREE.Vector2(isMobile ? 1000 : 1200, isMobile ? 2000 : 1200),
        useMap: 1,
        map: bandTexture,
        repeat: new THREE.Vector2(-4, 1),
        lineWidth: 1,
      });
      material.depthTest = false;
      return material;
    },
    [isMobile, bandTexture],
  );

  useRopeJoint(fixed as RefObject<RapierRigidBody>, j1 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1 as RefObject<RapierRigidBody>, j2 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2 as RefObject<RapierRigidBody>, j3 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3 as RefObject<RapierRigidBody>, card as RefObject<RapierRigidBody>, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useEffect(() => {
    let cancelled = false;

    const syncTextures = async () => {
      if (cardImage) {
        const capturedCardImage = await loadBadgeImage(cardImage);
        const nextFrontTexture = capturedCardImage
          ? createCapturedCardTexture(capturedCardImage)
          : createBadgeTexture({ image: null, user: badgeUser, side: "front" });
        const nextBackTexture = capturedCardImage
          ? createCapturedCardTexture(capturedCardImage)
          : createBadgeTexture({ image: null, user: badgeUser, side: "back" });

        if (cancelled) {
          nextFrontTexture.dispose();
          nextBackTexture.dispose();
          return;
        }

        setFrontTexture((previousTexture) => {
          previousTexture?.dispose();
          return nextFrontTexture;
        });
        setBackTexture((previousTexture) => {
          previousTexture?.dispose();
          return nextBackTexture;
        });
        return;
      }

      const fallbackFrontTexture = createBadgeTexture({ image: null, user: badgeUser, side: "front" });
      const fallbackBackTexture = createBadgeTexture({ image: null, user: badgeUser, side: "back" });

      setFrontTexture((previousTexture) => {
        previousTexture?.dispose();
        return fallbackFrontTexture;
      });
      setBackTexture((previousTexture) => {
        previousTexture?.dispose();
        return fallbackBackTexture;
      });

      const image = await loadBadgeImage(profileImage);
      const nextFrontTexture = createBadgeTexture({ image, user: badgeUser, side: "front" });
      const nextBackTexture = createBadgeTexture({ image, user: badgeUser, side: "back" });

      if (cancelled) {
        nextFrontTexture.dispose();
        nextBackTexture.dispose();
        return;
      }

      setFrontTexture((previousTexture) => {
        previousTexture?.dispose();
        return nextFrontTexture;
      });
      setBackTexture((previousTexture) => {
        previousTexture?.dispose();
        return nextBackTexture;
      });
    };

    void syncTextures();

    return () => {
      cancelled = true;
    };
  }, [badgeUser, cardImage, profileImage]);

  useEffect(() => {
    return () => {
      bandTextureRef.current?.dispose();
      frontTextureRef.current?.dispose();
      backTextureRef.current?.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => {
        ref.current?.wakeUp();
      });
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        const rigidBody = ref.current as RigidBodyWithLerp | null;
        if (!rigidBody) return;
        if (!rigidBody.lerped) {
          rigidBody.lerped = new THREE.Vector3().copy(rigidBody.translation());
        }
        const clampedDistance = Math.max(0.1, Math.min(1, rigidBody.lerped.distanceTo(rigidBody.translation())));
        rigidBody.lerped.lerp(rigidBody.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });

      if (!j1.current || !j2.current || !j3.current || !card.current) return;
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy((j2.current as RigidBodyWithLerp).lerped ?? j2.current.translation());
      curve.points[2].copy((j1.current as RigidBodyWithLerp).lerped ?? j1.current.translation());
      curve.points[3].copy(fixed.current.translation());
      lineGeometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.06]} />
          <group
            scale={2.2}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(event: ThreeEvent<PointerEvent>) => {
              const target = event.target as EventTarget & {
                releasePointerCapture?: (pointerId: number) => void;
              };
              target.releasePointerCapture?.(event.pointerId);
              drag(false);
            }}
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              const target = event.target as EventTarget & {
                setPointerCapture?: (pointerId: number) => void;
              };
              target.setPointerCapture?.(event.pointerId);
              if (!card.current) return;
              drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <RoundedBox args={[1.55, 2.12, 0.08]} radius={0.1} smoothness={4}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.22} metalness={0.08} clearcoat={1} clearcoatRoughness={0.15} />
            </RoundedBox>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.38, 1.94]} />
              <meshBasicMaterial color="#ffffff" map={frontTexture} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.38, 1.94]} />
              <meshBasicMaterial color="#ffffff" map={backTexture} toneMapped={false} />
            </mesh>
            <mesh position={[0, 1.15, 0.02]}>
              <boxGeometry args={[0.2, 0.28, 0.1]} />
              <meshStandardMaterial color="#d8d0f7" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <primitive attach="geometry" object={lineGeometry} />
        <primitive attach="material" object={lineMaterial} />
      </mesh>
    </>
  );
}
