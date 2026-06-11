import Scene from "../model/sceneModel.js";

export const saveScene = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { objects } = req.body;

    if (!Array.isArray(objects)) {
      return res.status(400).json({
        message: "objects must be an array",
      });
    }

    const scene = await Scene.findOneAndUpdate(
      { userId },
      { userId, objects },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Scene saved successfully",
      scene,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error saving scene",
      error: error.message,
    });
  }
};

export const getScene = async (req, res) => {
  try {
    const userId = req.session.userId;

    const scene = await Scene.findOne({ userId });

    return res.status(200).json(scene || { userId, objects: [] });
  } catch (error) {
    return res.status(500).json({
      message: "Error loading scene",
      error: error.message,
    });
  }
};