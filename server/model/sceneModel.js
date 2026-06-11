import mongoose from "mongoose";

const sceneSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    objects: [
      {
        id: {
          type: String,
        },
        objectType: {
          type: String,
          required: true,
        },
        position: {
          x: Number,
          y: Number,
          z: Number,
        },
        rotation: {
          x: Number,
          y: Number,
          z: Number,
        },
        scale: {
          x: Number,
          y: Number,
          z: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Scene", sceneSchema);