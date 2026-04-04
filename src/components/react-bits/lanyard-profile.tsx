"use client";

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
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
  profileImage = null,
  user = null,
}: LanyardProfileProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (contextLost) {
    return (
      <div className={styles.wrapper}>
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-strong">3D Lanyard Unavailable</p>
          <p className="max-w-sm text-sm leading-6 text-muted">
            브라우저 그래픽 컨텍스트가 재설정되어 인터랙티브 랜야드를 잠시 표시할 수 없습니다. 페이지를 새로 열거나 다시 촬영하면 다시 시도할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Canvas
        fallback={
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
            이 브라우저에서는 3D 랜야드를 표시할 수 없습니다.
          </div>
        }
        className={styles.canvas}
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);

          const canvas = gl.domElement;
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
          };

          canvas.addEventListener("webglcontextlost", handleContextLost, { once: true });
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} profileImage={profileImage} user={user} />
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

  if (image) {
    // 꽉 차게 (cover), 중앙 정렬
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;
    
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    // 이미지가 없을 때의 Fallback
    const fallback = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    fallback.addColorStop(0, "#f3f0eb");
    fallback.addColorStop(0.55, "#ece7de");
    fallback.addColorStop(1, "#dfd8cc");
    context.fillStyle = fallback;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(18,18,18,0.96)";
    context.textAlign = "center";
    context.font = "700 72px Inter, Arial, sans-serif";
    context.fillText(user?.nickname ?? "HackPort User", canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  // UV 매핑이 뒤집혀 있는 문제를 해결하기 위해 텍스처 레벨에서 상하좌우를 올바르게 보정합니다.
  texture.flipY = false; // 상하 반전 해결
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1; // 좌우 반전(거울상) 해결
  
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
useGLTF.preload("/card.glb");
useTexture.preload("/lanyard.png");

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  profileImage = null,
  user = null,
}: {
  maxSpeed?: number;
  minSpeed?: number;
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

  const { nodes, materials } = useGLTF("/card.glb") as unknown as {
    nodes: { card: THREE.Mesh; clip: THREE.Mesh; clamp: THREE.Mesh };
    materials: { base: THREE.MeshStandardMaterial; metal: THREE.MeshStandardMaterial };
  };

  const bandTexture = useTexture("/lanyard.png");

  useEffect(() => {
    bandTexture.wrapS = THREE.RepeatWrapping;
    bandTexture.wrapT = THREE.RepeatWrapping;
    bandTexture.anisotropy = 16;
    bandTexture.needsUpdate = true;
  }, [bandTexture]);

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
          resolution: new THREE.Vector2(1000, isMobile ? 2000 : 1000),
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
  }, [badgeUser, profileImage]);

  useEffect(() => {
    return () => {
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
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
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
            <mesh geometry={nodes.card.geometry}>
              <meshStandardMaterial
                map={frontTexture}
                map-anisotropy={16}
                roughness={1}
                metalness={0}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
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
