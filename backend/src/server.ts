import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDatabase } from "./config/database";
import { seedGames } from "./lib/games";
import authRouter from "./routes/auth";
import gamesRouter from "./routes/games";
import wordRushRouter from "./routes/wordRush";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "*" }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/games/word-rush", wordRushRouter);
app.use("/api/games", gamesRouter);

app.get("/health", (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ status: "ok", database: "connected" });
  } else {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

const PORT = Number(process.env.PORT) || 3001;

async function startServer(): Promise<void> {
  await connectDatabase();
  await seedGames();

  app.listen(PORT, () => {
    console.log(`NimGames backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});