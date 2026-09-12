"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNimiq } from "@/lib/nimiq/NimiqProvider";

function formatAddress(address: string): string {
  const clean = address.toUpperCase().replace(/\s+/g, "");
  if (!clean.startsWith("NQ")) {
    return clean;
  }
  const head = clean.slice(0, 4);
  const rest = clean.slice(4).match(/.{1,4}/g)?.join(" ") ?? clean.slice(4);
  return `${head} ${rest}`;
}

export function WalletAuth() {
  const { status, user, error, login, logout } = useAuth();
  const nimiq = useNimiq();
  const [pending, setPending] = useState(false);

  async function handleLogin() {
    setPending(true);
    try {
      await login();
    } finally {
      setPending(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-zinc-500">Checking wallet session…</p>;
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2">
        <span className="text-sm font-medium text-zinc-900">
          {formatAddress(user.address)}
        </span>
        <button
          onClick={logout}
          className="text-sm text-zinc-500 underline-offset-2 hover:underline"
        >
          Log out
        </button>
      </div>
    );
  }

  const walletReady = nimiq.status === "available";
  const busy = pending || nimiq.status === "loading";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleLogin}
        disabled={!walletReady || busy}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Waiting for wallet…" : "Connect wallet"}
      </button>
      {!walletReady && (
        <p className="text-xs text-zinc-400">
          {nimiq.status === "unavailable"
            ? "Requires Nimiq Pay. Interface appears inside the wallet."
            : ""}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}