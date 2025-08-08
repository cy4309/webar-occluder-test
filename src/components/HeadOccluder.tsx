import * as THREE from "three";

const HEAD_RADIUS = 1; // 人頭半徑

export default function HeadOccluder({ debug }: { debug: boolean }) {
  // debug=true: 半透明可見；debug=false: 不顯示顏色但寫入深度 → 真正的 occluder
  return (
    <mesh position={[0, 0, 0]} renderOrder={0}>
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
