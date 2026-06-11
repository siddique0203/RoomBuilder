import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import DraggableObject from "../components/DraggableObject";

const RoomShell = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#d8c8af" roughness={0.75} metalness={0.02} />
      </mesh>

      <gridHelper args={[10, 20, "#64748b", "#e2e8f0"]} position={[0, 0.01, 0]} />

      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.86} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.86} />
      </mesh>

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.86} />
      </mesh>

      <mesh position={[0, 2, -3.96]}>
        <boxGeometry args={[7.7, 2.45, 0.05]} />
        <meshStandardMaterial color="#3f5066" roughness={0.88} />
      </mesh>

      <mesh position={[0, 2, -3.92]}>
        <boxGeometry args={[7.2, 1.95, 0.055]} />
        <meshStandardMaterial color="#243244" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.08, 4]}>
        <boxGeometry args={[10, 0.16, 0.16]} />
        <meshStandardMaterial color="#8b5e34" roughness={0.55} />
      </mesh>

      <mesh position={[-5, 0.08, 0]}>
        <boxGeometry args={[0.16, 0.16, 8]} />
        <meshStandardMaterial color="#8b5e34" roughness={0.55} />
      </mesh>

      <mesh position={[5, 0.08, 0]}>
        <boxGeometry args={[0.16, 0.16, 8]} />
        <meshStandardMaterial color="#8b5e34" roughness={0.55} />
      </mesh>
    </group>
  );
};

const RoomScene = ({
  objects = [],
  updateObjectTransform,
  onObjectDragStart,
  onObjectDragEnd,
  isObjectDragging,
}) => {
  return (
    <div className="roomSceneWrapper">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
        }}
      >
        <color attach="background" args={["#cbd8e6"]} />
        <fog attach="fog" args={["#cbd8e6", 12, 25]} />

        <PerspectiveCamera
          makeDefault
          position={[6.4, 4.4, 7.2]}
          fov={45}
          near={0.1}
          far={100}
        />

        <ambientLight intensity={0.9} />

        <directionalLight
          position={[5, 8, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />

        <pointLight position={[-3, 3, 3]} intensity={0.7} color="#fff1d6" />
        <pointLight position={[4, 2.5, -2]} intensity={0.45} color="#dbeafe" />

        <RoomShell />

        <Suspense
          fallback={
            <Html center>
              <div className="sceneLoading">Loading 3D objects...</div>
            </Html>
          }
        >
          {objects.map((obj) => (
            <DraggableObject
              key={obj.id || obj._id}
              object={obj}
              updateObjectTransform={updateObjectTransform}
              onObjectDragStart={onObjectDragStart}
              onObjectDragEnd={onObjectDragEnd}
            />
          ))}
        </Suspense>

        <OrbitControls
          makeDefault
          enabled={!isObjectDragging}
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={13}
          maxPolarAngle={Math.PI / 2.08}
          target={[0, 1.1, 0]}
        />
      </Canvas>
    </div>
  );
};

export default RoomScene;