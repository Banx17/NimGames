"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon } from "@/components/shell/icons";
import type { AuthUser } from "@/lib/auth/walletAuth";
import type {
  WordRushDifficulty,
  WordRushGameMode,
} from "@/lib/wordRushClient";

interface CreateLobbyProps {
  difficulty: WordRushDifficulty;
  onDifficultyChange: (difficulty: WordRushDifficulty) => void;
  mode: WordRushGameMode;
  onModeChange: (mode: WordRushGameMode) => void;
  onCreate: () => void;
  onJoin: (joinCode: string) => void;
  user: AuthUser | null;
  router: ReturnType<typeof useRouter>;
}

export function CreateLobby({
  difficulty,
  onDifficultyChange,
  mode,
  onModeChange,
  onCreate,
  onJoin,
  user,
  router,
}: CreateLobbyProps) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-5">
        <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-nim-text-muted">
          <BoltIcon className="h-3.5 w-3.5" />
          Create a session
        </span>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-nim-text-muted">
            Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["solo", "1v1"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "border-nim-primary/60 bg-nim-primary/15 text-nim-accent"
                    : "border-nim-border/60 text-nim-text-muted hover:border-nim-border"
                }`}
              >
                {m === "solo" ? "Solo" : "1v1"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-nim-text-muted">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDifficultyChange(d)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors ${
                  difficulty === d
                    ? "border-nim-primary/60 bg-nim-primary/15 text-nim-accent"
                    : "border-nim-border/60 text-nim-text-muted hover:border-nim-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-nim-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Create session
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-nim-text-muted">
          Join with a code
        </span>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter join code"
            className="min-w-0 flex-1 rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm text-nim-text placeholder:text-nim-text-muted/60 focus:border-nim-primary/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onJoin(joinCode.trim())}
            className="rounded-lg border border-nim-primary/60 px-4 py-2 text-sm font-semibold text-nim-accent transition-colors hover:bg-nim-primary/10"
          >
            Join
          </button>
        </div>
        <p className="text-xs text-nim-text-muted">
          {user
            ? `Playing as ${user.address.slice(0, 6)}…${user.address.slice(-4)}.`
            : "Connect your wallet to play."}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-fit text-xs font-medium text-nim-accent underline underline-offset-2"
          >
            Back to games
          </button>
        )}
      </div>
    </div>
  );
}
