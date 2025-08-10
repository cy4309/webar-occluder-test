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

// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// import * as THREE from "three";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
// import faceMeshIndices from "@/utils/faceMeshIndices";

// // --- MediaPipe model paths ---
// const MODEL_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
// const LANDMARKER_MODEL =
//   "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// // ===== 讓 <video> 變成滿版背景（在 WebGL 同一空間） =====
// function VideoPlane({
//   video,
//   mirrored = true,
// }: {
//   video: HTMLVideoElement;
//   mirrored?: boolean;
// }) {
//   const texture = useMemo(() => {
//     const t = new THREE.VideoTexture(video);
//     t.minFilter = THREE.LinearFilter;
//     t.magFilter = THREE.LinearFilter;
//     t.format = THREE.RGBAFormat;
//     return t;
//   }, [video]);

//   // 讓平面隨視窗尺寸滿版（以 z=0 的 viewport 為基準）
//   const { viewport } = useThree();
//   const w = viewport.width;
//   const h = viewport.height;

//   return (
//     <mesh
//       renderOrder={-1}
//       position={[0, 0, -0.02]}
//       scale={[mirrored ? -1 : 1, 1, 1]}
//     >
//       <planeGeometry args={[w, h]} />
//       <meshBasicMaterial map={texture} toneMapped={false} />
//     </mesh>
//   );
// }

// // ===== 把 Mediapipe 的 4x4 矩陣直接套到 Group（頭部錨點） =====
// function HeadAnchor({
//   getMatrix,
//   children,
//   mirrorX = true,
// }: {
//   getMatrix: () => Float32Array | null;
//   children: React.ReactNode;
//   mirrorX?: boolean;
// }) {
//   const groupRef = useRef<THREE.Group>(null);
//   const tmp = useMemo(() => new THREE.Matrix4(), []);
//   const flip = useMemo(() => new THREE.Matrix4().makeScale(-1, 1, 1), []);
//   useFrame(() => {
//     const m = getMatrix();
//     if (!m || !groupRef.current) return;
//     groupRef.current.matrixAutoUpdate = false;
//     tmp.fromArray(m);
//     if (mirrorX) tmp.premultiply(flip); // 前鏡頭左右鏡像校正
//     groupRef.current.matrix.copy(tmp);
//   });
//   return <group ref={groupRef}>{children}</group>;
// }

// // ===== 臉部 Occluder（在「頭部局部座標」重建幾何） =====
// function FaceMaskOccluder({
//   getLandmarks,
//   debug,
// }: {
//   getLandmarks: () => { x: number; y: number; z: number }[] | null;
//   debug: boolean;
// }) {
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame(() => {
//     const landmarks = getLandmarks();
//     if (!landmarks || !meshRef.current) return;

//     // 注意：在 HeadAnchor 的局部座標建幾何，不要再乘 4x4 matrix
//     const positions = new Float32Array(landmarks.length * 3);
//     for (let i = 0; i < landmarks.length; i++) {
//       const p = landmarks[i];
//       const o = i * 3;
//       positions[o] = p.x - 0.5; // 以臉中心為原點
//       positions[o + 1] = -(p.y - 0.5);
//       positions[o + 2] = p.z;
//     }
//     const idx = new Uint32Array(faceMeshIndices.length * 3);
//     for (let i = 0; i < faceMeshIndices.length; i++) {
//       const [a, b, c] = faceMeshIndices[i];
//       const o = i * 3;
//       idx[o] = a;
//       idx[o + 1] = b;
//       idx[o + 2] = c;
//     }
//     const geo = new THREE.BufferGeometry();
//     geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     geo.setIndex(new THREE.BufferAttribute(idx, 1));
//     geo.computeVertexNormals();

//     meshRef.current.geometry.dispose?.();
//     meshRef.current.geometry = geo;
//   });

//   return (
//     <mesh ref={meshRef} renderOrder={0.5} frustumCulled={false}>
//       <bufferGeometry />
//       <meshBasicMaterial
//         // debug: 半透明顯示；否則只寫入深度（真正遮擋）
//         color={debug ? "deepskyblue" : undefined}
//         opacity={debug ? 0.35 : 1}
//         transparent
//         colorWrite={debug}
//         depthWrite
//         depthTest
//         side={THREE.BackSide}
//       />
//     </mesh>
//   );
// }

// // ===== 帽子模型（掛在 HeadAnchor 底下，跟頭一起動） =====
// function HatModel({
//   y = 0.35,
//   z = 0.0,
//   scale = 0.18,
// }: {
//   y?: number;
//   z?: number;
//   scale?: number;
// }) {
//   const { scene } = useGLTF("/hat.glb");
//   useEffect(() => {
//     scene.traverse((o: any) => {
//       if (o.isMesh) {
//         o.renderOrder = 2; // 在 occluder 後渲染
//         o.material.depthTest = true;
//         o.material.depthWrite = true;
//         o.frustumCulled = false;
//       }
//     });
//   }, [scene]);

//   return <primitive object={scene} position={[0, y, z]} scale={scale} />;
// }
// useGLTF.preload("/hat.glb");

// // ===== 主頁：相機影像滿版 + 戴帽子 Try-on =====
// export default function Home() {
//   const [debug, setDebug] = useState(true); // 顯示/隱藏臉遮罩
//   const [mirrored, setMirrored] = useState(true); // 前鏡頭鏡像
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const [videoReady, setVideoReady] = useState(false);

//   // Mediapipe 結果保存
//   const resultsRef = useRef<{
//     landmarks: { x: number; y: number; z: number }[] | null;
//     matrix: Float32Array | null;
//   }>({ landmarks: null, matrix: null });

//   useEffect(() => {
//     let landmarker: FaceLandmarker | null = null;
//     let raf = 0;

//     const init = async () => {
//       // 相機：HTTPS 或 localhost
//       const isSecure =
//         window.isSecureContext ||
//         location.protocol === "https:" ||
//         location.hostname === "localhost";
//       if (!isSecure) {
//         alert("需要在 HTTPS 或 localhost 執行");
//         return;
//       }
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: false,
//       });
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       video.muted = true;
//       video.autoplay = true;
//       video.playsInline = true;
//       await video.play();
//       videoRef.current = video;
//       setVideoReady(true);
//       setMirrored(true); // 前鏡頭預設鏡像

//       // Mediapipe
//       const vision = await FilesetResolver.forVisionTasks(MODEL_URL);
//       landmarker = await FaceLandmarker.createFromOptions(vision, {
//         baseOptions: { modelAssetPath: LANDMARKER_MODEL, delegate: "GPU" },
//         runningMode: "VIDEO",
//         numFaces: 1,
//         outputFaceBlendshapes: false,
//         outputFacialTransformationMatrixes: true,
//       });

//       const loop = async () => {
//         if (videoRef.current && landmarker) {
//           const res = await landmarker.detectForVideo(
//             videoRef.current,
//             Date.now()
//           );
//           if (
//             res?.faceLandmarks?.length &&
//             res.facialTransformationMatrixes?.length
//           ) {
//             resultsRef.current.landmarks = res.faceLandmarks[0] as any;
//             resultsRef.current.matrix = res.facialTransformationMatrixes[0]
//               .data as any;
//           } else {
//             resultsRef.current.landmarks = null;
//             resultsRef.current.matrix = null;
//           }
//         }
//         raf = requestAnimationFrame(loop);
//       };
//       raf = requestAnimationFrame(loop);
//     };

//     init();
//     return () => cancelAnimationFrame(raf);
//   }, []);

//   return (
//     <div className="w-full h-[100dvh] bg-black relative">
//       {/* 小工具列：顯示遮罩/鏡像切換/簡單校準 */}
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 10,
//           right: 12,
//           top: 12,
//           background: "rgba(0,0,0,.55)",
//           color: "#fff",
//           borderRadius: 10,
//           padding: 10,
//           display: "flex",
//           gap: 8,
//         }}
//       >
//         <button
//           onClick={() => setDebug((v) => !v)}
//           style={{
//             padding: "6px 10px",
//             borderRadius: 6,
//             border: 0,
//             cursor: "pointer",
//           }}
//         >
//           {debug ? "遮擋模式" : "顯示臉"}
//         </button>
//         <button
//           onClick={() => setMirrored((v) => !v)}
//           style={{
//             padding: "6px 10px",
//             borderRadius: 6,
//             border: 0,
//             cursor: "pointer",
//           }}
//         >
//           {mirrored ? "鏡像：開" : "鏡像：關"}
//         </button>
//       </div>

//       <Canvas camera={{ position: [0, 0, 1.6], fov: 50 }}>
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[3, 5, 3]} intensity={0.9} />

//         {/* 滿版相機影像（在 WebGL 同場景） */}
//         {videoReady && videoRef.current && (
//           <VideoPlane video={videoRef.current} mirrored={mirrored} />
//         )}

//         {/* 頭部錨點：把 matrix 套到 Group，裡面放遮罩與帽子 */}
//         <HeadAnchor
//           getMatrix={() => resultsRef.current.matrix}
//           mirrorX={mirrored}
//         >
//           {/* 臉遮罩（debug: 半透明 / 遮擋：不畫色只寫深度） */}
//           <FaceMaskOccluder
//             getLandmarks={() => resultsRef.current.landmarks}
//             debug={debug}
//           />
//           {/* 帽子（局部位移在頭頂） */}
//           <Suspense fallback={null}>
//             <HatModel y={0.35} z={0} scale={0.18} />
//           </Suspense>
//         </HeadAnchor>

//         {/* 可轉視角檢查（實測時可以先開著，正式上線可關） */}
//         <OrbitControls
//           target={[0, 0.35, 0]}
//           minDistance={1.2}
//           maxDistance={5}
//         />
//       </Canvas>
//     </div>
//   );
// }
