import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
}, { versionKey: false });

export interface UserDocument {
  address: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export const User = mongoose.model<UserDocument>("User", userSchema);