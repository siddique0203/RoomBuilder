import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";

import userRoutes from "./routes/userRoutes.js";
import sceneRoutes from "./routes/sceneRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

if (!MONGO_URL) {
  throw new Error("MONGO_URL is missing from environment variables");
}

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from environment variables");
}

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.0.128:3000",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "roombuilder.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/api", userRoutes);
app.use("/api", sceneRoutes);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });