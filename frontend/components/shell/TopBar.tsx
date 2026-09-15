"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ChevronRightIcon, LogoPlaceholder } from "./icons";

function formatAddress(address: string): string {
  const clean = address.toUpperCase().replace(/\s+/g, "");
  if (!clean.startsWith("NQ")) {
    return clean.slice(0, 10);
  }
  const head = clean.slice(0, 4);
  const rest = clean.slice(4).match(/.{1,4}/g)?.join(" ") ?? clean.slice(4);
  return `${head} ${rest}`;
}

export function TopBar() {
  const { status, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-nim-border bg-nim-bg/90 px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <LogoPlaceholder className="h-7 w-7 text-nim-primary" />
        <span className="text-base font-semibold tracking-tight text-nim-white">
          NimGames
        </span>
      </Link>

      <Link
        href="/wallet"
        className="flex items-center gap-1.5 rounded-full border border-nim-border bg-nim-surface px-3 py-1.5 text-xs font-medium text-nim-text-secondary transition-colors hover:border-nim-border-strong hover:text-nim-text"
      >
        {status === "authenticated" && user ? (
          <>
            <span
              className="h-1.5 w-1.5 rounded-full bg-nim-success"
              aria-hidden="true"
            />
            <span className="font-mono">{formatAddress(user.address)}</span>
          </>
        ) : (
          <span>Connect wallet</span>
        )}
        <ChevronRightIcon className="h-3.5 w-3.5 text-nim-text-muted" />
      </Link>
    </header>
  );
}
