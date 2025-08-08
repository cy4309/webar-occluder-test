import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls } from "@react-three/drei";
import BaseButton from "@/components/BaseButton";
// import HeadOccluder from "@/components/HeadOccluder";
// import HatModel from "@/components/HatModel";

const HEAD_RADIUS = 1; // 人頭半徑
const HAT_SCALE = 0.8; // 帽子縮放
const HAT_SINK = -HEAD_RADIUS + 0.15; // 帽子往下“戴入”頭部的深度（越大越深入）

function HeadOccluder({ debug }: { debug: boolean }) {
  // debug=true: 半透明可見；debug=false: 不顯示顏色但寫入深度 → 真正的 occluder
  return (
    <mesh position={[0, HEAD_RADIUS, 0]} renderOrder={0}>
      <sphereGeometry args={[HEAD_RADIUS, 48, 32]} />
      <meshBasicMaterial
        color={debug ? "deepskyblue" : undefined}
        transparent
        opacity={debug ? 1 : 1}
        depthWrite
        depthTest
        colorWrite={debug ? true : false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function HatModel() {
  const { scene } = useGLTF("/hat.glb");

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.renderOrder = 2; // 在 occluder 之後渲染
        obj.material.depthTest = true;
        obj.material.depthWrite = true; // 需要時可切成 false 比較
        obj.frustumCulled = false;
      }
    });
  }, [scene]);

  // 把帽子放在頭頂上並“壓進去”一點（產生穿戴與遮擋）
  return (
    <primitive
      object={scene}
      position={[0, HEAD_RADIUS - HAT_SINK, 0]}
      rotation={[0, 0, 0]}
      scale={HAT_SCALE}
    />
  );
}

useGLTF.preload("/hat.glb");

export default function Home() {
  const [debug, setDebug] = useState(true);

  return (
    <div className="w-full h-[100dvh] relative">
      <BaseButton
        onClick={() => setDebug((v) => !v)}
        className="absolute z-10 right-3 top-3"
      >
        {debug ? "隱藏頭部（啟用遮擋）" : "顯示頭部（半透明）"}
      </BaseButton>

      <Canvas camera={{ position: [0, 0.6, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.9} />
        <gridHelper args={[8, 16, 0x333333, 0x222222]} />
        <axesHelper args={[2]} />

        <HeadOccluder debug={debug} />
        <Suspense fallback={null}>
          <HatModel />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={6}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  );
}
