import { init, type NimiqProvider } from "@nimiq/mini-app-sdk";

export type NimiqStatus = "loading" | "available" | "unavailable";

let initPromise: Promise<NimiqProvider | null> | null = null;

async function initializeNimiq(): Promise<NimiqProvider | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return await init({ timeout: 10_000 });
  } catch (error) {
    console.error("Nimiq Mini App SDK initialization failed:", error);
    return null;
  }
}

export function getNimiq(): Promise<NimiqProvider | null> {
  if (!initPromise) {
    initPromise = initializeNimiq();
  }
  return initPromise;
}