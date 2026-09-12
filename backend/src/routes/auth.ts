import { randomBytes } from "node:crypto";
import { Router } from "express";
import { Address } from "@nimiq/core";
import { AuthChallenge } from "../models/AuthChallenge";
import { User } from "../models/User";
import {
  normalizeAddress,
  verifyWalletSignature,
} from "../lib/nimiqVerify";
import { isAuthConfigured, signAuthToken } from "../lib/authToken";
import { requireAuth } from "../middleware/requireAuth";
import type { AuthedRequest } from "../middleware/requireAuth";

const CHALLENGE_TTL_SECONDS = 10 * 60;
const MAX_OPEN_CHALLENGES = 20;

const router = Router();

export function isValidNimiqAddress(input: string): boolean {
  try {
    Address.fromUserFriendlyAddress(normalizeAddress(input));
    return true;
  } catch {
    return false;
  }
}

router.post("/challenge", async (req, res) => {
  const { address } = req.body ?? {};

  if (typeof address !== "string" || !isValidNimiqAddress(address)) {
    res.status(400).json({ error: { message: "Invalid Nimiq address" } });
    return;
  }

  const walletAddress = normalizeAddress(address);
  const openChallenges = await AuthChallenge.countDocuments({
    walletAddress,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (openChallenges >= MAX_OPEN_CHALLENGES) {
    res
      .status(429)
      .json({ error: { message: "Too many pending challenges, try again later" } });
    return;
  }

  const challenge = `nimgames-login:${randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000);

  await AuthChallenge.create({ _id: challenge, walletAddress, expiresAt });

  res.json({ challenge, expiresIn: CHALLENGE_TTL_SECONDS });
});

router.post("/verify", async (req, res) => {
  if (!isAuthConfigured()) {
    res.status(500).json({ error: { message: "AUTH_JWT_SECRET is not configured" } });
    return;
  }

  const { address, challenge, publicKey, signature } = req.body ?? {};

  if (typeof address !== "string" || !isValidNimiqAddress(address)) {
    res.status(400).json({ error: { message: "Invalid Nimiq address" } });
    return;
  }
  if (
    typeof challenge !== "string" ||
    typeof publicKey !== "string" ||
    typeof signature !== "string"
  ) {
    res.status(400).json({ error: { message: "Invalid request body" } });
    return;
  }

  const walletAddress = normalizeAddress(address);
  const consumed = await AuthChallenge.findOneAndUpdate(
    {
      _id: challenge,
      walletAddress,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!consumed) {
    res.status(401).json({ error: { message: "Invalid or expired challenge" } });
    return;
  }

  const signatureValid = verifyWalletSignature({
    message: challenge,
    signatureHex: signature,
    publicKeyHex: publicKey,
    address: walletAddress,
  });

  if (!signatureValid) {
    res.status(401).json({ error: { message: "Signature verification failed" } });
    return;
  }

  const now = new Date();
  const user = await User.findOneAndUpdate(
    { address: walletAddress },
    { $set: { lastLoginAt: now }, $setOnInsert: { address: walletAddress, createdAt: now } },
    { returnDocument: "after", upsert: true },
  );

  if (!user) {
    res.status(500).json({ error: { message: "Failed to load user" } });
    return;
  }

  const token = signAuthToken(walletAddress);

  res.json({
    token,
    user: {
      address: user.address,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findOne({ address: req.auth!.address });

  if (!user) {
    res.status(401).json({ error: { message: "Not authenticated" } });
    return;
  }

  res.json({
    user: {
      address: user.address,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

export default router;