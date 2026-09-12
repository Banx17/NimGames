import jwt from "jsonwebtoken";
import { normalizeAddress } from "./nimiqVerify";

const JWT_SECRET = process.env.AUTH_JWT_SECRET;
const JWT_TTL_SECONDS = Number(process.env.AUTH_JWT_TTL_SECONDS ?? 60 * 60 * 24 * 7);

export interface AuthTokenClaims {
  address: string;
}

export function isAuthConfigured(): boolean {
  return Boolean(JWT_SECRET);
}

export function signAuthToken(address: string): string {
  if (!JWT_SECRET) {
    throw new Error("AUTH_JWT_SECRET environment variable is not set");
  }

  return jwt.sign({ sub: normalizeAddress(address) }, JWT_SECRET, {
    expiresIn: JWT_TTL_SECONDS,
  });
}

export function verifyAuthToken(token: string): AuthTokenClaims | null {
  if (!JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null;
    }
    return { address: payload.sub };
  } catch {
    return null;
  }
}