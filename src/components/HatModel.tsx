import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const HEAD_RADIUS = 1; // 人頭半徑
const HAT_SCALE = 0.8; // 帽子縮放
const HAT_SINK = 0.25; // 帽子往下“戴入”頭部的深度（越大越深入）

export default function HatModel() {
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
