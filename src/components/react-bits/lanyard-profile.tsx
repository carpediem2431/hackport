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
}

type RigidBodyWithLerp = RapierRigidBody & { lerped?: THREE.Vector3 };

export default function LanyardProfile({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
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
          <Band isMobile={isMobile} />
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

function createLanyardTexture() {
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

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
}: {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
}) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const texture = useMemo(() => createLanyardTexture(), []);
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
  const lineGeometry = useMemo(() => new MeshLineGeometry(), []);
  const lineMaterial = useMemo(
    () => {
      const material = new MeshLineMaterial({
        color: "#ffffff",
        resolution: new THREE.Vector2(isMobile ? 1000 : 1200, isMobile ? 2000 : 1200),
        useMap: 1,
        map: texture,
        repeat: new THREE.Vector2(-4, 1),
        lineWidth: 1,
      });
      material.depthTest = false;
      return material;
    },
    [isMobile, texture],
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
    return () => {
      texture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial, texture]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
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
              <meshStandardMaterial color="#f6f1ff" />
            </mesh>
            <mesh position={[0, 0.88, 0.12]}>
              <boxGeometry args={[0.45, 0.14, 0.12]} />
              <meshStandardMaterial color="#b19eef" metalness={0.35} roughness={0.25} />
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
