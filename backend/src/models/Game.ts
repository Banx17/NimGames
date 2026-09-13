import mongoose from "mongoose";

export type GameStatus = "available" | "coming-soon";

const gameSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["available", "coming-soon"], required: true },
  icon: { type: String, required: true },
  modes: { type: [String], default: [] },
}, { versionKey: false });

export interface GameDocument {
  _id: string;
  name: string;
  description: string;
  status: GameStatus;
  icon: string;
  modes: string[];
}

export const Game = mongoose.model<GameDocument>("Game", gameSchema);