import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls } from "@react-three/drei";
//@ts-expect-error
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import BaseButton from "@/components/BaseButton";

const HEAD_RADIUS = 1;
const HAT_SCALE = 5.5;
const HAT_SINK = -HEAD_RADIUS + 0.15;

// #region video
function VideoBackground({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const textureRef = useRef<THREE.VideoTexture>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        textureRef.current = new THREE.VideoTexture(video);
        textureRef.current.minFilter = THREE.LinearFilter;
        textureRef.current.magFilter = THREE.LinearFilter;
        textureRef.current.format = THREE.RGBAFormat;
        setReady(true);
      };
    });
  }, [videoRef]);

  if (!ready || !textureRef.current) return null;

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[4, 3]} />
      <meshBasicMaterial map={textureRef.current} toneMapped={false} />
    </mesh>
  );
}

// #region head occluder
function HeadOccluder({ debug }: { debug: boolean }) {
  const mesh = useLoader(FBXLoader, "/faceMesh.fbx");

  useEffect(() => {
    mesh.traverse((child: any) => {
      if (child.isMesh) {
        child.renderOrder = 0;
        child.material = new THREE.MeshBasicMaterial({
          color: debug ? "deepskyblue" : undefined,
          transparent: true,
          opacity: debug ? 0.4 : 1,
          depthWrite: true,
          depthTest: true,
          colorWrite: debug,
          side: THREE.BackSide,
        });
      }
    });
  }, [mesh, debug]);

  return <primitive object={mesh} scale={0.3} />;
}

// #region hat
function HatModel() {
  const { scene } = useGLTF("/tiger-hat2.glb");

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.renderOrder = 2;
        obj.material.depthTest = true;
        obj.material.depthWrite = true;
        obj.frustumCulled = false;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0, HEAD_RADIUS - HAT_SINK, 0]}
      rotation={[0, 0, 0]}
      scale={HAT_SCALE}
    />
  );
}

useGLTF.preload("/tiger-hat2.glb");

// #region home
export default function Home() {
  const [debug, setDebug] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full h-[100dvh] relative">
      {/* Video DOM element (hidden) */}
      <video ref={videoRef} className="hidden" />

      <BaseButton
        onClick={() => setDebug((v) => !v)}
        className="absolute z-10 right-3 top-3"
      >
        {debug ? "隱藏頭部（啟用遮擋）" : "顯示頭部（半透明）"}
      </BaseButton>

      <Canvas camera={{ position: [0, 0.6, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.9} />
        {/* 格線 */}
        <gridHelper args={[8, 16, 0x333333, 0x222222]} />
        <axesHelper args={[2]} />

        <Suspense fallback={null}>
          <VideoBackground videoRef={videoRef} />
          <HeadOccluder debug={debug} />
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
