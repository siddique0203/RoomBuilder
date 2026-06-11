import React, { useState } from "react";
import "./AddObjectModal.css";

const AddObjectModal = ({ addObject, closeModal }) => {
  const [selectedObject, setSelectedObject] = useState("cube");

  const objectList = [
  {
    type: "cube",
    title: "Cube",
    description: "Basic 3D object",
  },
  {
    type: "sphere",
    title: "Sphere",
    description: "Basic round 3D object",
  },
  {
    type: "bed",
    title: "Bed",
    description: "Custom GLB model",
  },
  {
    type: "bookshelf",
    title: "Book Shelf",
    description: "Custom GLB model",
  },
  {
    type: "chair",
    title: "Chair",
    description: "Custom GLB model",
  },
  {
    type: "piano",
    title: "Piano",
    description: "Custom GLB model",
  },
  {
    type: "sidetable",
    title: "Side Table",
    description: "Custom GLB model",
  },
];

  const handleSubmit = (event) => {
    event.preventDefault();
    addObject(selectedObject);
  };

  return (
    <div className="modalOverlay" onClick={closeModal}>
      <form
        className="objectModal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <div>
            <h2>Add Object</h2>
            <p>Select an object to place inside the 3D room.</p>
          </div>

          <button type="button" className="modalCloseBtn" onClick={closeModal}>
            ×
          </button>
        </div>

        <div className="objectRadioList">
          {objectList.map((item) => (
            <label
              key={item.type}
              className={`objectRadioItem ${
                selectedObject === item.type ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="objectType"
                value={item.type}
                checked={selectedObject === item.type}
                onChange={() => setSelectedObject(item.type)}
              />

              <span className="customRadio"></span>

              <span className="radioText">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </div>

        <div className="modalActions">
          <button type="button" className="cancelObjectBtn" onClick={closeModal}>
            Cancel
          </button>

          <button type="submit" className="addSelectedBtn">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddObjectModal;