"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getNimiq, type NimiqStatus } from "../nimiq";

interface NimiqContextValue {
  status: NimiqStatus;
}

const NimiqContext = createContext<NimiqContextValue | null>(null);

export function NimiqProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<NimiqStatus>("loading");

  useEffect(() => {
    getNimiq()
      .then((client) => setStatus(client ? "available" : "unavailable"))
      .catch(() => setStatus("unavailable"));
  }, []);

  return (
    <NimiqContext.Provider value={{ status }}>
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