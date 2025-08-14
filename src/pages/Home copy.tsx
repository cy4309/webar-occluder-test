import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls } from "@react-three/drei";
//@ts-expect-error
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import BaseButton from "@/components/BaseButton";
// import HeadOccluder from "@/components/HeadOccluder";
// import HatModel from "@/components/HatModel";

const HEAD_RADIUS = 1; // 人頭半徑
const HAT_SCALE = 5.5; // 帽子縮放
const HAT_SINK = -HEAD_RADIUS + 0.15; // 帽子往下“戴入”頭部的深度（越大越深入）

// function HeadOccluder({ debug }: { debug: boolean }) {
//   // debug=true: 半透明可見；debug=false: 不顯示顏色但寫入深度 → 真正的 occluder
//   return (
//     <mesh position={[0, HEAD_RADIUS, 0]} renderOrder={0}>
//       <sphereGeometry args={[HEAD_RADIUS, 48, 32]} />
//       <meshBasicMaterial
//         color={debug ? "deepskyblue" : undefined}
//         transparent
//         opacity={debug ? 1 : 1}
//         depthWrite
//         depthTest
//         colorWrite={debug ? true : false}
//         side={THREE.BackSide}
//       />
//     </mesh>
//   );
// }

function HeadOccluder({ debug }: { debug: boolean }) {
  const mesh = useLoader(FBXLoader, "/faceMesh.fbx");

  useEffect(() => {
    mesh.traverse((child: any) => {
      if (child.isMesh) {
        child.renderOrder = 0;

        // occluder 材質設定
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

  // 假如你的 FBX 是臉的中心點在原點，就不用移動了
  return <primitive object={mesh} scale={0.3} />;
}

function HatModel() {
  const { scene } = useGLTF("/tiger-hat2.glb");

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
// import { useGLTF } from "@react-three/drei";
// import { useLoader } from "@react-three/fiber";
// // @ts-ignore
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

// // ---- MediaPipe ----
// const MODEL_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
// const LANDMARKER_MODEL =
//   "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// /** 視野貼滿的 Video 平面（鎖在相機前、永遠正對） */
// function FullscreenVideoPlane({
//   video,
//   mirrored = true,
//   dist = 0.1,
// }: {
//   video: HTMLVideoElement;
//   mirrored?: boolean;
//   dist?: number;
// }) {
//   const { camera, size } = useThree();
//   const tex = useMemo(() => {
//     const t = new THREE.VideoTexture(video);
//     t.minFilter = THREE.LinearFilter;
//     t.magFilter = THREE.LinearFilter;
//     t.format = THREE.RGBAFormat;
//     return t;
//   }, [video]);
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame(() => {
//     const cam = camera as THREE.PerspectiveCamera;
//     const fov = (cam.fov * Math.PI) / 180;
//     const h = 2 * Math.tan(fov / 2) * dist;
//     const w = h * (size.width / size.height);
//     if (meshRef.current) {
//       meshRef.current.position.set(0, 0, -dist);
//       meshRef.current.quaternion.copy(cam.quaternion);
//       (meshRef.current.geometry as THREE.PlaneGeometry)?.dispose?.();
//       meshRef.current.geometry = new THREE.PlaneGeometry(w, h);
//     }
//   });

//   return (
//     <mesh ref={meshRef} renderOrder={-1} scale={[mirrored ? -1 : 1, 1, 1]}>
//       <planeGeometry args={[1, 1]} />
//       <meshBasicMaterial map={tex} toneMapped={false} />
//     </mesh>
//   );
// }

// /** 用 Mediapipe 的 4×4 矩陣驅動的頭部錨點 */
// function HeadAnchor({
//   getMatrix,
//   mirrorX = true,
//   children,
// }: {
//   getMatrix: () => Float32Array | null;
//   mirrorX?: boolean;
//   children: React.ReactNode;
// }) {
//   const groupRef = useRef<THREE.Group>(null);
//   const tmp = useMemo(() => new THREE.Matrix4(), []);
//   const flipX = useMemo(() => new THREE.Matrix4().makeScale(-1, 1, 1), []);
//   useFrame(() => {
//     const m = getMatrix();
//     if (!m || !groupRef.current) return;
//     groupRef.current.matrixAutoUpdate = false;
//     tmp.fromArray(m);
//     if (mirrorX) tmp.premultiply(flipX); // 前鏡頭鏡像校正
//     groupRef.current.matrix.copy(tmp);
//   });
//   return <group ref={groupRef}>{children}</group>;
// }

// /** 以 face.obj 當遮擋器：不出色、只寫入深度（debug 可見） */
// function FaceOccluderOBJ({
//   debug = false,
//   scale = 1,
//   offset = new THREE.Vector3(0, 0, 0),
// }: {
//   debug?: boolean;
//   scale?: number;
//   offset?: THREE.Vector3;
// }) {
//   // 載入 OBJ（若有 MTL，可另外加載 MTLLoader 後再設給 OBJLoader）
//   const obj = useLoader(OBJLoader, "/face.obj");

//   const depthOnlyMat = useMemo(
//     () =>
//       new THREE.MeshBasicMaterial({
//         color: debug ? new THREE.Color("deepskyblue") : undefined,
//         transparent: true,
//         opacity: debug ? 0.35 : 1,
//         depthWrite: true,
//         depthTest: true,
//         colorWrite: debug, // debug=false → 不輸出顏色；debug=true → 顯示半透明方便對位
//         side: THREE.BackSide,
//       }),
//     [debug]
//   );

//   useEffect(() => {
//     obj.traverse((o: any) => {
//       if (o.isMesh) {
//         o.renderOrder = 0.5;
//         o.frustumCulled = false;
//         o.material = depthOnlyMat; // 替換材質為「只寫入深度」
//       }
//     });
//   }, [obj, depthOnlyMat]);

//   return <primitive object={obj} position={offset} scale={scale} />;
// }
// // 可選：預先載入 OBJ
// // (useLoader as any).preload?.(OBJLoader, "/face.obj");

// /** 帽子模型（跟著頭動；可微調高度/前後/縮放） */
// function HatModel({
//   y = 0.35,
//   z = 0,
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
//         o.renderOrder = 2;
//         o.material.depthTest = true;
//         o.material.depthWrite = true;
//         o.frustumCulled = false;
//       }
//     });
//   }, [scene]);
//   return <primitive object={scene} position={[0, y, z]} scale={scale} />;
// }
// useGLTF.preload("/hat.glb");

// export default function Home() {
//   const [debugFace, setDebugFace] = useState(false);
//   const [mirrored, setMirrored] = useState(true);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const [videoReady, setVideoReady] = useState(false);

//   // 只存 Mediapipe 的頭部 4×4 矩陣
//   const matrixRef = useRef<Float32Array | null>(null);

//   useEffect(() => {
//     let landmarker: FaceLandmarker | null = null;
//     let raf = 0;

//     const init = async () => {
//       const isSecure =
//         window.isSecureContext ||
//         location.protocol === "https:" ||
//         location.hostname === "localhost";
//       if (!isSecure) {
//         alert("請在 HTTPS 或 localhost 執行");
//         return;
//       }

//       // 啟動相機（前鏡頭）
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
//       setMirrored(true);

//       // Mediapipe：只要 4×4 矩陣
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
//           if (res?.facialTransformationMatrixes?.length) {
//             matrixRef.current = res.facialTransformationMatrixes[0].data as any;
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
//       {/* 小工具列 */}
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
//           onClick={() => setDebugFace((v) => !v)}
//           style={{
//             padding: "6px 10px",
//             border: 0,
//             borderRadius: 6,
//             cursor: "pointer",
//           }}
//         >
//           {debugFace ? "遮擋模式" : "顯示臉（半透明）"}
//         </button>
//         <button
//           onClick={() => setMirrored((v) => !v)}
//           style={{
//             padding: "6px 10px",
//             border: 0,
//             borderRadius: 6,
//             cursor: "pointer",
//           }}
//         >
//           {mirrored ? "鏡像：開" : "鏡像：關"}
//         </button>
//       </div>

//       <Canvas camera={{ position: [0, 0, 1.6], fov: 50 }}>
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[3, 5, 3]} intensity={0.9} />

//         {/* 背景相機影像（在相機前方、滿版） */}
//         {videoReady && videoRef.current && (
//           <FullscreenVideoPlane video={videoRef.current} mirrored={mirrored} />
//         )}

//         {/* 頭部錨點：矩陣直接驅動；把 face.obj（遮擋）與帽子掛進來 */}
//         <HeadAnchor getMatrix={() => matrixRef.current} mirrorX={mirrored}>
//           <Suspense fallback={null}>
//             {/* face.obj 當 Occluder（用 scale/offset 做對位微調） */}
//             <FaceOccluderOBJ
//               debug={debugFace}
//               scale={1.0}
//               offset={new THREE.Vector3(0, 0, 0)}
//             />
//             <HatModel y={0.35} z={0} scale={0.18} />
//           </Suspense>
//         </HeadAnchor>
//       </Canvas>
//     </div>
//   );
// }
