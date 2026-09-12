"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNimiq } from "../nimiq/NimiqProvider";
import { ApiError } from "../api";
import {
  clearSession,
  fetchCurrentUser,
  requestChallenge,
  verifyLogin,
  type AuthUser,
} from "./walletAuth";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated"
  | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { client: nimiq } = useNimiq();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((current) => {
        if (cancelled) {
          return;
        }
        setUser(current);
        setStatus(current ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async () => {
    setError(null);

    if (!nimiq) {
      setError("Wallet unavailable. Open NimGames inside Nimiq Pay to connect.");
      setStatus("error");
      return;
    }

    try {
      const accounts = await nimiq.listAccounts();
      const address = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;

      if (!address) {
        throw new Error("No wallet accounts found.");
      }

      const challenge = await requestChallenge(address);
      const proof = await nimiq.sign(challenge);

      if (!proof || !("signature" in proof)) {
        throw new Error("The wallet declined the signing request.");
      }

      const currentUser = await verifyLogin({
        address,
        challenge,
        publicKey: proof.publicKey,
        signature: proof.signature,
      });

      setUser(currentUser);
      setStatus("authenticated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed.";
      setError(message);
      setStatus("error");
    }
  }, [nimiq]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}