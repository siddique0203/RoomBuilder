import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ScenePage.css";
import AddObjectModal from "../components/AddObjectModal";
import RoomScene from "../scenes/RoomScene";
import { saveScene, loadScene, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const ROOM = {
  left: -5,
  right: 5,
  back: -4,
  front: 4,
};

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

    bed: "bed",

    bookshelf: "bookshelf",
    bookself: "bookshelf",
    bookshelve: "bookshelf",
    bookshelves: "bookshelf",

    chair: "chair",
    piano: "piano",

    sidetable: "sidetable",
    side: "sidetable",
    table: "sidetable",
  };

  return typeMap[cleanType] || cleanType;
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const getStartPosition = (type) => {
  if (type === "cube") {
    return {
      x: randomBetween(-3, 3),
      y: 0.5,
      z: randomBetween(-2.2, 2.2),
    };
  }

  if (type === "sphere") {
    return {
      x: randomBetween(-3, 3),
      y: 0.55,
      z: randomBetween(-2.2, 2.2),
    };
  }

  if (type === "bed") {
    return {
      x: randomBetween(-2.4, 2.4),
      y: 0,
      z: randomBetween(-2.4, 1.8),
    };
  }

  if (type === "bookshelf") {
    return {
      x: randomBetween(-3.2, 3.2),
      y: 0,
      z: ROOM.back + 0.45,
    };
  }

  if (type === "piano") {
    return {
      x: randomBetween(-2.8, 2.8),
      y: 0,
      z: ROOM.back + 0.65,
    };
  }

  return {
    x: randomBetween(-3.2, 3.2),
    y: 0,
    z: randomBetween(-2.2, 2.2),
  };
};

const getStartRotation = (type) => {
  if (type === "bookshelf") {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  if (type === "piano") {
    return {
      x: 0,
      y: Math.PI,
      z: 0,
    };
  }

  return {
    x: 0,
    y: 0,
    z: 0,
  };
};

const getStartScale = () => {
  return {
    x: 1,
    y: 1,
    z: 1,
  };
};

const normalizeVector = (value, fallback) => {
  return {
    x: Number(value?.x ?? fallback.x),
    y: Number(value?.y ?? fallback.y),
    z: Number(value?.z ?? fallback.z),
  };
};

const fixFloorObjectPosition = (type, position) => {
  const fixed = { ...position };

  fixed.x = Math.min(Math.max(fixed.x, ROOM.left + 0.5), ROOM.right - 0.5);
  fixed.z = Math.min(Math.max(fixed.z, ROOM.back + 0.5), ROOM.front - 0.5);

  if (type === "cube") {
    fixed.y = 0.5;
  } else if (type === "sphere") {
    fixed.y = 0.55;
  } else {
    fixed.y = 0;
  }

  return fixed;
};

const normalizeLoadedObject = (obj) => {
  const objectType = normalizeObjectType(obj.objectType);
  const defaultPosition = getStartPosition(objectType);
  const defaultRotation = getStartRotation(objectType);
  const defaultScale = getStartScale(objectType);

  let position = normalizeVector(obj.position, defaultPosition);

  if (position.y < -0.8) {
    position = defaultPosition;
  }

  position = fixFloorObjectPosition(objectType, position);

  let rotation = normalizeVector(obj.rotation, defaultRotation);

  rotation.x = 0;
  rotation.z = 0;

  return {
    ...obj,
    id:
      obj.id ||
      obj._id ||
      `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    objectType,
    position,
    rotation,
    scale: normalizeVector(obj.scale, defaultScale),
  };
};

const ScenePage = () => {
  const [objects, setObjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [draggingObjectId, setDraggingObjectId] = useState(null);

  const pointerPositionRef = useRef({ x: 0, y: 0 });
  const statusTimerRef = useRef(null);
  const navigate = useNavigate();

  const showStatus = useCallback((message) => {
    setStatus(message);

    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }

    statusTimerRef.current = setTimeout(() => {
      setStatus("");
    }, 1800);
  }, []);

  useEffect(() => {
    const fetchScene = async () => {
      try {
        const response = await loadScene();
        const loadedObjects = (response.data.objects || []).map(
          normalizeLoadedObject
        );

        setObjects(loadedObjects);
      } catch (error) {
        console.error("Error loading scene:", error);

        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchScene();
  }, [navigate]);

  const addObject = (objectType) => {
    const finalType = normalizeObjectType(objectType);
    const position = getStartPosition(finalType);

    const newObject = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      objectType: finalType,
      position,
      rotation: getStartRotation(finalType),
      scale: getStartScale(finalType),
    };

    setObjects((prevObjects) => [...prevObjects, newObject]);
    setShowModal(false);
  };

  const updateObjectTransform = (id, transform) => {
    setObjects((prevObjects) =>
      prevObjects.map((obj) => {
        const currentId = obj.id || obj._id;

        if (String(currentId) !== String(id)) {
          return obj;
        }

        return {
          ...obj,
          position: transform.position || obj.position,
          rotation: transform.rotation || obj.rotation,
          scale: transform.scale || obj.scale,
        };
      })
    );
  };

  const deleteObject = useCallback(
    (id) => {
      setObjects((prevObjects) =>
        prevObjects.filter((obj) => String(obj.id || obj._id) !== String(id))
      );

      showStatus("Object deleted. Click Save to keep changes.");
    },
    [showStatus]
  );

  const checkDeleteZone = useCallback(
    (id, x, y) => {
      const deleteZone = document.querySelector(".deleteDropZone");
      if (!deleteZone) return;

      const rect = deleteZone.getBoundingClientRect();

      const isInsideDeleteZone =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (isInsideDeleteZone) {
        deleteObject(id);
      }
    },
    [deleteObject]
  );

  useEffect(() => {
    const handlePointerMove = (event) => {
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerUp = () => {
      if (!draggingObjectId) return;

      checkDeleteZone(
        draggingObjectId,
        pointerPositionRef.current.x,
        pointerPositionRef.current.y
      );

      setDraggingObjectId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingObjectId, checkDeleteZone]);

  const handleObjectDragStart = (id, event) => {
    const sourceEvent = event?.sourceEvent || event?.nativeEvent || event;

    pointerPositionRef.current = {
      x: sourceEvent?.clientX ?? pointerPositionRef.current.x,
      y: sourceEvent?.clientY ?? pointerPositionRef.current.y,
    };

    setDraggingObjectId(id);
  };

  const handleObjectDragEnd = (id, event) => {
    const sourceEvent = event?.sourceEvent || event?.nativeEvent || event;

    const x = sourceEvent?.clientX ?? pointerPositionRef.current.x;
    const y = sourceEvent?.clientY ?? pointerPositionRef.current.y;

    checkDeleteZone(id, x, y);
    setDraggingObjectId(null);
  };

  const handleSave = async () => {
    try {
      await saveScene(objects);
      showStatus("3D scene saved successfully!");
    } catch (error) {
      console.error("Error saving scene:", error);

      if (error.response?.status === 401) {
        showStatus("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 900);
        return;
      }

      showStatus("Error saving scene.");
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="scenePage">
      <div className="sceneTopBar">
        <button className="btn addObjectBtn" onClick={() => setShowModal(true)}>
          <span className="btnIcon">+</span>
          Add Objects
        </button>

        <button className="btn saveBtn" onClick={handleSave}>
          <span className="btnIcon">▣</span>
          Save
        </button>
      </div>

      <div className="sceneHelpBox">
        <strong>3D Mode</strong>
        <span>
          Drag objects to move them. Furniture stays straight and aligns near
          walls. Click empty floor or wall to rotate the room.
        </span>
      </div>

      <div className="signOutContainer">
        <button className="btn signOutBtn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {status && <div className="sceneStatus">{status}</div>}

      <div className={`deleteDropZone ${draggingObjectId ? "active" : ""}`}>
        <div className="deleteIconBox">🗑</div>
        <div>
          <strong>Delete Object</strong>
          <span>Drag here and release</span>
        </div>
      </div>

      <div className="sceneCanvasBox">
        <RoomScene
          objects={objects}
          updateObjectTransform={updateObjectTransform}
          onObjectDragStart={handleObjectDragStart}
          onObjectDragEnd={handleObjectDragEnd}
          isObjectDragging={Boolean(draggingObjectId)}
        />
      </div>

      {showModal && (
        <AddObjectModal
          addObject={addObject}
          closeModal={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ScenePage;