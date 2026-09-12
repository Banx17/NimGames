"use client";

import { useNimiq } from "@/lib/nimiq/NimiqProvider";

export function NimiqStatus() {
  const { status } = useNimiq();

  return (
    <p className="font-medium">
      {/* Temporary Nimiq SDK status test — remove when wallet auth lands. */}
      {status === "loading" && "Nimiq Pay: Checking..."}
      {status === "available" && "Nimiq Pay: Connected"}
      {status === "unavailable" && "Nimiq Pay: Not available"}
    </p>
  );
}