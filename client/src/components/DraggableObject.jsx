import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const ROOM = {
  left: -5,
  right: 5,
  back: -4,
  front: 4,
  floorY: 0,
  wallMinY: 0.85,
  wallMaxY: 3.35,
};

const WALL_GAP = 0.38;
const WALL_SNAP_DISTANCE = 0.58;

const MODEL_CONFIG = {
  bed: {
    path: "/models/bed.glb",
    modelSize: 2.4,
    dragMode: "floor",
    modelRotation: [0, 0, 0],
  },
  bookshelf: {
    path: "/models/book_self.glb",
    modelSize: 1.9,
    dragMode: "floor",
    modelRotation: [0, 0, 0],
  },
  chair: {
    path: "/models/chair.glb",
    modelSize: 1.25,
    dragMode: "floor",
    modelRotation: [0, 0, 0],
  },
  piano: {
    path: "/models/piano.glb",
    modelSize: 1.95,
    dragMode: "floor",
    modelRotation: [0, 0, 0],
  },
  sidetable: {
    path: "/models/Side%20table.glb",
    modelSize: 1.15,
    dragMode: "floor",
    modelRotation: [0, 0, 0],
  },
};

const WALLS = [
  {
    id: "back",
    planePoint: new THREE.Vector3(0, 0, ROOM.back + 0.08),
    normal: new THREE.Vector3(0, 0, 1),
    rotationY: 0,
  },
  {
    id: "left",
    planePoint: new THREE.Vector3(ROOM.left + 0.08, 0, 0),
    normal: new THREE.Vector3(1, 0, 0),
    rotationY: Math.PI / 2,
  },
  {
    id: "right",
    planePoint: new THREE.Vector3(ROOM.right - 0.08, 0, 0),
    normal: new THREE.Vector3(-1, 0, 0),
    rotationY: -Math.PI / 2,
  },
];

const normalizeObjectType = (type = "") => {
  const cleanType = String(type)
    .toLowerCase()
    .replace(/\.glb/g, "")
    .replace(/%20/g, "")
    .replace(/[\s_-]/g, "");

  const typeMap = {
    cube: "cube",
    box: "cube",
    sphere: "sphere",
    ball: "sphere",
    chair: "chair",
    piano: "piano",
    clock: "clock",
    analogclock: "clock",
    analog: "clock",
    sidetable: "sidetable",
    side: "sidetable",
    table: "sidetable",
  };

  return typeMap[cleanType] || cleanType;
};

const toVectorArray = (value, fallback = [0, 0, 0]) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "number") {
    return [value, value, value];
  }

  return [
    Number(value?.x ?? fallback[0]),
    Number(value?.y ?? fallback[1]),
    Number(value?.z ?? fallback[2]),
  ];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getFloorY = (type) => {
  if (type === "cube") return 0.5;
  if (type === "sphere") return 0.55;
  return 0;
};

const getWallRotationY = (wallId) => {
  if (wallId === "left") return Math.PI / 2;
  if (wallId === "right") return -Math.PI / 2;
  if (wallId === "front") return Math.PI;
  return 0;
};

const getNearestFloorWall = (position) => {
  const distances = [
    { id: "left", distance: Math.abs(position.x - ROOM.left) },
    { id: "right", distance: Math.abs(position.x - ROOM.right) },
    { id: "back", distance: Math.abs(position.z - ROOM.back) },
    { id: "front", distance: Math.abs(position.z - ROOM.front) },
  ];

  distances.sort((a, b) => a.distance - b.distance);

  if (distances[0].distance <= WALL_SNAP_DISTANCE) {
    return distances[0].id;
  }

  return null;
};

const applyFloorWallSnap = (position, currentRotationY) => {
  const wall = getNearestFloorWall(position);
  const nextPosition = position.clone();
  let nextRotationY = currentRotationY;

  if (wall === "left") {
    nextPosition.x = ROOM.left + WALL_GAP;
    nextPosition.z = clamp(nextPosition.z, ROOM.back + 0.5, ROOM.front - 0.5);
    nextRotationY = getWallRotationY("left");
  }

  if (wall === "right") {
    nextPosition.x = ROOM.right - WALL_GAP;
    nextPosition.z = clamp(nextPosition.z, ROOM.back + 0.5, ROOM.front - 0.5);
    nextRotationY = getWallRotationY("right");
  }

  if (wall === "back") {
    nextPosition.z = ROOM.back + WALL_GAP;
    nextPosition.x = clamp(nextPosition.x, ROOM.left + 0.5, ROOM.right - 0.5);
    nextRotationY = getWallRotationY("back");
  }

  if (wall === "front") {
    nextPosition.z = ROOM.front - WALL_GAP;
    nextPosition.x = clamp(nextPosition.x, ROOM.left + 0.5, ROOM.right - 0.5);
    nextRotationY = getWallRotationY("front");
  }

  if (!wall) {
    nextPosition.x = clamp(nextPosition.x, ROOM.left + 0.5, ROOM.right - 0.5);
    nextPosition.z = clamp(nextPosition.z, ROOM.back + 0.5, ROOM.front - 0.5);
  }

  return {
    position: nextPosition,
    rotationY: nextRotationY,
  };
};

const getBestWallHit = (ray) => {
  let bestHit = null;

  WALLS.forEach((wall) => {
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      wall.normal,
      wall.planePoint
    );

    const point = new THREE.Vector3();
    const hit = ray.intersectPlane(plane, point);

    if (!hit) return;

    let isInsideWall = false;

    if (wall.id === "back") {
      isInsideWall =
        point.x >= ROOM.left + 0.45 &&
        point.x <= ROOM.right - 0.45 &&
        point.y >= ROOM.wallMinY &&
        point.y <= ROOM.wallMaxY;
    }

    if (wall.id === "left" || wall.id === "right") {
      isInsideWall =
        point.z >= ROOM.back + 0.45 &&
        point.z <= ROOM.front - 0.45 &&
        point.y >= ROOM.wallMinY &&
        point.y <= ROOM.wallMaxY;
    }

    if (!isInsideWall) return;

    const distance = ray.origin.distanceTo(point);

    if (!bestHit || distance < bestHit.distance) {
      bestHit = {
        wallId: wall.id,
        point,
        rotationY: wall.rotationY,
        distance,
      };
    }
  });

  return bestHit;
};

const PrimitiveObject = ({ type, isDragging }) => {
  if (type === "sphere") {
    return (
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.55, 48, 32]} />
        <meshStandardMaterial
          color={isDragging ? "#f97316" : "#2563eb"}
          roughness={0.35}
          metalness={0.12}
        />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isDragging ? "#f97316" : "#dc2626"}
        roughness={0.42}
        metalness={0.08}
      />
    </mesh>
  );
};

const GltfObject = ({ type }) => {
  const config = MODEL_CONFIG[type];
  const gltf = useGLTF(config.path);

  const normalizedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;

        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => material.clone());
        } else if (child.material) {
          child.material = child.material.clone();
        }
      }
    });

    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const largestAxis = Math.max(size.x, size.y, size.z);
    const safeAxis = largestAxis > 0 ? largestAxis : 1;
    const normalizedScale = config.modelSize / safeAxis;

    clone.scale.setScalar(normalizedScale);

    if (config.dragMode === "wall") {
      clone.position.set(
        -center.x * normalizedScale,
        -center.y * normalizedScale,
        -center.z * normalizedScale
      );
    } else {
      clone.position.set(
        -center.x * normalizedScale,
        -box.min.y * normalizedScale,
        -center.z * normalizedScale
      );
    }

    return clone;
  }, [gltf.scene, config.modelSize, config.dragMode]);

  return (
    <group rotation={config.modelRotation}>
      <primitive object={normalizedScene} />
    </group>
  );
};

const DraggableObject = ({
  object,
  updateObjectTransform,
  onObjectDragStart,
  onObjectDragEnd,
}) => {
  const groupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const intersectionPointRef = useRef(new THREE.Vector3());

  const [isDragging, setIsDragging] = useState(false);

  const objectId = object.id || object._id;
  const objectType = normalizeObjectType(object.objectType);

  const isPrimitive = objectType === "cube" || objectType === "sphere";
  const dragMode = MODEL_CONFIG[objectType]?.dragMode || "floor";

  const defaultY = getFloorY(objectType);
  const defaultZ = objectType === "clock" ? ROOM.back + 0.08 : 0;

  const position = toVectorArray(object.position, [0, defaultY, defaultZ]);
  const rotation = toVectorArray(object.rotation, [0, 0, 0]);
  const scale = toVectorArray(object.scale, [1, 1, 1]);

  /*
    Important:
    Force models to stand straight.
    Only Y rotation is allowed.
  */
  const cleanRotation = [0, rotation[1], 0];

  const activeScale = isDragging ? 1.06 : 1;

  const displayScale = [
    scale[0] * activeScale,
    scale[1] * activeScale,
    scale[2] * activeScale,
  ];

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const saveCurrentTransform = () => {
    if (!groupRef.current) return;

    const currentPosition = groupRef.current.position;
    const currentRotation = groupRef.current.rotation;

    updateObjectTransform?.(objectId, {
      position: {
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
      },
      rotation: {
        x: 0,
        y: currentRotation.y,
        z: 0,
      },
      scale: {
        x: scale[0],
        y: scale[1],
        z: scale[2],
      },
    });
  };

  const setupFloorDragPlane = () => {
    if (!groupRef.current) return;

    const currentY = groupRef.current.position.y;
    dragPlaneRef.current.set(new THREE.Vector3(0, 1, 0), -currentY);
  };

  const getFloorIntersection = (event) => {
    if (!event.ray) return null;

    const hit = event.ray.intersectPlane(
      dragPlaneRef.current,
      intersectionPointRef.current
    );

    return hit ? intersectionPointRef.current.clone() : null;
  };

  const handlePointerDown = (event) => {
    event.stopPropagation();

    if (!groupRef.current) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = "grabbing";

    /*
      Keep the room still while object is being dragged.
      OrbitControls is disabled from RoomScene during this time.
    */
    if (dragMode === "floor") {
      setupFloorDragPlane();

      const intersection = getFloorIntersection(event);

      if (intersection) {
        dragOffsetRef.current.copy(groupRef.current.position).sub(intersection);
      }
    }

    event.target.setPointerCapture?.(event.pointerId);
    onObjectDragStart?.(objectId, event);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || !groupRef.current) return;

    event.stopPropagation();

    if (dragMode === "wall") {
      const wallHit = getBestWallHit(event.ray);

      if (!wallHit) return;

      const point = wallHit.point;

      if (wallHit.wallId === "back") {
        groupRef.current.position.set(
          clamp(point.x, ROOM.left + 0.5, ROOM.right - 0.5),
          clamp(point.y, ROOM.wallMinY, ROOM.wallMaxY),
          ROOM.back + 0.08
        );
      }

      if (wallHit.wallId === "left") {
        groupRef.current.position.set(
          ROOM.left + 0.08,
          clamp(point.y, ROOM.wallMinY, ROOM.wallMaxY),
          clamp(point.z, ROOM.back + 0.5, ROOM.front - 0.5)
        );
      }

      if (wallHit.wallId === "right") {
        groupRef.current.position.set(
          ROOM.right - 0.08,
          clamp(point.y, ROOM.wallMinY, ROOM.wallMaxY),
          clamp(point.z, ROOM.back + 0.5, ROOM.front - 0.5)
        );
      }

      /*
        Clock synchronization:
        back wall  = rotation 0
        left wall  = rotation PI / 2
        right wall = rotation -PI / 2
      */
      groupRef.current.rotation.set(0, wallHit.rotationY, 0);
      return;
    }

    const intersection = getFloorIntersection(event);
    if (!intersection) return;

    const nextPosition = intersection.clone().add(dragOffsetRef.current);

    nextPosition.y = groupRef.current.position.y;

    const snapped = applyFloorWallSnap(
      nextPosition,
      groupRef.current.rotation.y
    );

    groupRef.current.position.set(
      snapped.position.x,
      groupRef.current.position.y,
      snapped.position.z
    );

    /*
      Chair, table, piano etc. remain upright.
      They only rotate around Y axis when near walls.
    */
    groupRef.current.rotation.set(0, snapped.rotationY, 0);
  };

  const handlePointerUp = (event) => {
    if (!isDraggingRef.current) return;

    event.stopPropagation();

    isDraggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = "default";

    event.target.releasePointerCapture?.(event.pointerId);

    saveCurrentTransform();
    onObjectDragEnd?.(objectId, event);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={cleanRotation}
      scale={displayScale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerOver={(event) => {
        event.stopPropagation();

        if (!isDraggingRef.current) {
          document.body.style.cursor = "grab";
        }
      }}
      onPointerOut={() => {
        if (!isDraggingRef.current) {
          document.body.style.cursor = "default";
        }
      }}
    >
      {isPrimitive ? (
        <PrimitiveObject type={objectType} isDragging={isDragging} />
      ) : MODEL_CONFIG[objectType] ? (
        <GltfObject type={objectType} />
      ) : (
        <PrimitiveObject type="cube" isDragging={isDragging} />
      )}
    </group>
  );
};

useGLTF.preload("/models/bed.glb");
useGLTF.preload("/models/book_self.glb");
useGLTF.preload("/models/chair.glb");
useGLTF.preload("/models/piano.glb");
useGLTF.preload("/models/Side%20table.glb");

export default DraggableObject;