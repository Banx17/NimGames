import { ApiError, apiFetch } from "../api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./authToken";

export interface AuthUser {
  address: string;
  createdAt: string;
  lastLoginAt: string;
}

interface ChallengeResponse {
  challenge: string;
  expiresIn: number;
}

interface VerifyResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser | null;
}

export async function requestChallenge(address: string): Promise<string> {
  const { challenge } = await apiFetch<ChallengeResponse>("/api/auth/challenge", {
    method: "POST",
    body: { address },
  });
  return challenge;
}

export interface SignProof {
  publicKey: string;
  signature: string;
}

export async function verifyLogin(
  input: { address: string; challenge: string } & SignProof,
): Promise<AuthUser> {
  const { token, user } = await apiFetch<VerifyResponse>("/api/auth/verify", {
    method: "POST",
    body: input,
  });
  setAuthToken(token);
  return user;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const { user } = await apiFetch<MeResponse>("/api/auth/me", { token });
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthToken();
      return null;
    }
    throw error;
  }
}

export function clearSession(): void {
  clearAuthToken();
}