"use client";

import { BoltIcon } from "@/components/shell/icons";
import type { WordRushSessionPublic } from "@/lib/wordRushClient";

interface GameLobbyProps {
  session: WordRushSessionPublic;
  answer: string;
  onAnswerChange: (answer: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  ready: boolean;
  onReadyChange: (ready: boolean) => void;
  readyPending: boolean;
  onMarkReady: () => void;
  onStart: () => void;
}

export function GameLobby({
  session,
  answer,
  onAnswerChange,
  submitting,
  onSubmit,
  ready,
  onReadyChange,
  readyPending,
  onMarkReady,
  onStart,
}: GameLobbyProps) {
  const isWaiting =
    session.wordRush.sessionStatus === "created" ||
    session.wordRush.sessionStatus === "countdown";
  const isLobbyWaiting =
    session.mode === "1v1" && session.wordRush.sessionStatus === "created";

  const readyPlayerCount =
    session.wordRush.readyPlayerAddresses?.length ?? 0;
  const myReady =
    session.wordRush.players.some(
      (p) => p.address === session.currentPlayerAddress && p.ready,
    ) || ready;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-nim-border/60 bg-nim-surface-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-4 w-4 text-nim-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-nim-text">
              Session {session.id.slice(0, 8)}
            </span>
            <span className="text-[11px] text-nim-text-muted">
              Round {session.wordRush.currentRound} · {session.wordRush.difficulty}
            </span>
          </div>
        </div>

        {session.joinCode && (
          <span className="rounded-md border border-nim-primary/40 bg-nim-primary/10 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-nim-accent">
            CODE {session.joinCode}
          </span>
        )}
      </div>

      {session.mode === "1v1" && (
        <div className="grid grid-cols-2 gap-3">
          {(session.wordRush.players.length > 0
            ? session.wordRush.players.slice(0, 2)
            : [null, null]
          ).map((player, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-xl border border-nim-border/60 bg-nim-surface-panel px-3 py-2.5"
            >
              {player ? (
                <>
                  <span className="text-[11px] text-nim-text-muted">
                    Player {i + 1}
                  </span>
                  <span className="text-sm font-medium text-nim-text">
                    {player.address.slice(0, 6)}…{player.address.slice(-4)}
                  </span>
                  <span className="text-[11px] text-nim-success">
                    {player.score} pts
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-nim-text-muted">
                    Player {i + 1}
                  </span>
                  <span className="text-sm font-medium text-nim-text-muted">
                    Waiting for opponent…
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {isWaiting ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-nim-border/40 bg-nim-surface-dimmer/40 py-8">
          <BoltIcon className="h-5 w-5 text-nim-accent" />
          <p className="text-sm font-medium text-nim-text">
            {session.mode === "1v1"
              ? "Waiting for opponent to join…"
              : "Preparing your session…"}
          </p>
          {session.mode === "1v1" && (
            <p className="text-xs text-nim-text-muted">
              Share this code so a friend can join your lobby.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-nim-accent">
              Round {session.wordRush.currentRound} · Word{" "}
              {(session.wordRush.currentWordIndex ?? 0) + 1}
            </span>
            {session.wordRush.currentWord ? (
              <p className="text-xl font-bold tracking-tight text-nim-text">
                {session.wordRush.currentWord}
              </p>
            ) : (
              <p className="text-sm text-nim-text-muted">No word available yet.</p>
            )}
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <input
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer…"
              autoComplete="off"
              autoFocus
              className="rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm text-nim-text placeholder:text-nim-text-muted/60 focus:border-nim-primary/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-nim-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit answer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
