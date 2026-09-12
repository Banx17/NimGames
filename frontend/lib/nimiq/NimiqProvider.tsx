"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getNimiq, type NimiqStatus } from "../nimiq";
import type { NimiqProvider as NimiqProviderInstance } from "@nimiq/mini-app-sdk";

interface NimiqContextValue {
  status: NimiqStatus;
  client: NimiqProviderInstance | null;
}

const NimiqContext = createContext<NimiqContextValue | null>(null);

export function NimiqProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<NimiqStatus>("loading");
  const [client, setClient] = useState<NimiqProviderInstance | null>(null);

  useEffect(() => {
    getNimiq()
      .then((provider) => {
        setClient(provider);
        setStatus(provider ? "available" : "unavailable");
      })
      .catch(() => setStatus("unavailable"));
  }, []);

  return (
    <NimiqContext.Provider value={{ status, client }}>
      {children}
    </NimiqContext.Provider>
  );
}

export function useNimiq(): NimiqContextValue {
  const context = useContext(NimiqContext);

  if (!context) {
    throw new Error("useNimiq must be used within a NimiqProvider");
  }

  return context;
}