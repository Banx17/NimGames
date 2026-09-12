import mongoose from "mongoose";

const authChallengeSchema = new mongoose.Schema({
  _id: { type: String },
  walletAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
}, { versionKey: false });

authChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface AuthChallengeDocument {
  _id: string;
  walletAddress: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
}

export const AuthChallenge = mongoose.model<AuthChallengeDocument>(
  "AuthChallenge",
  authChallengeSchema,
);