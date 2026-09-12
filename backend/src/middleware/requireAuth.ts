import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/authToken";

export interface AuthedRequest extends Request {
  auth?: AuthClaims;
}

export interface AuthClaims {
  address: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  const claims = token ? verifyAuthToken(token) : null;
  if (!claims) {
    res.status(401).json({ error: { message: "Not authenticated" } });
    return;
  }

  req.auth = claims;
  next();
}