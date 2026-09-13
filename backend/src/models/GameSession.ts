import mongoose from "mongoose";

export type GameSessionStatus = "pending" | "active" | "completed" | "cancelled";

const gameSessionSchema = new mongoose.Schema({
  game: { type: String, ref: "Game", required: true },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  },
  players: { type: [String], default: [] },
  winner: { type: String, default: null },
  state: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { versionKey: false });

gameSessionSchema.index({ game: 1, status: 1 });

export interface GameSessionDocument {
  _id: mongoose.Types.ObjectId;
  game: string;
  status: GameSessionStatus;
  players: string[];
  winner: string | null;
  state: Record<string, unknown>;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export const GameSession = mongoose.model<GameSessionDocument>(
  "GameSession",
  gameSessionSchema,
);