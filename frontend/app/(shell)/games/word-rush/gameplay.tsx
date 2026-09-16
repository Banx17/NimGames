"use client";

import { BoltIcon } from "@/components/shell/icons";
import type {
  WordRushSessionPublic,
  WordRushPlayerProgress,
} from "@/lib/wordRushClient";

interface GamePlayProps {
  session: WordRushSessionPublic;
  answer: string;
  onAnswerChange: (answer: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function sortByScore(players: WordRushPlayerProgress[]): WordRushPlayerProgress[] {
  return [...players].sort((a, b) => b.score - a.score);
}

export function GamePlay({
  session,
  answer,
  onAnswerChange,
  submitting,
  onSubmit,
  onBack,
}: GamePlayProps) {
  const wordRush = session.wordRush;

  const isCompleted = wordRush.sessionStatus === "completed";
  const isCountdown = wordRush.sessionStatus === "countdown" || wordRush.countdownRemainingSeconds !== null;
  const hasCurrentWord = wordRush.currentWord !== null;

  if (isCompleted) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-nim-text-muted">
            Game complete
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-nim-text">
            Final score
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {sortByScore(wordRush.players).map((player) => (
            <div
              key={player.address}
              className="flex items-center justify-between rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm"
            >
              <span className="truncate text-nim-text">{shortAddress(player.address)}</span>
              <span className="font-semibold tabular-nums text-nim-accent">
                {player.score} pts
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg bg-nim-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to games
          </button>
        </div>
      </div>
    );
  }

  if (isCountdown) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-nim-border/60 bg-nim-surface-panel px-4 py-8">
        <span className="tabular-nums text-5xl font-bold text-nim-accent">
          {wordRush.countdownRemainingSeconds ?? 0}
        </span>
        <span className="text-xs text-nim-text-muted">Get ready…</span>
      </div>
    );
  }

  if (hasCurrentWord) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-5">
        <div className="flex items-center justify-between text-xs text-nim-text-muted">
          <span>
            Round {wordRush.currentRound} · Word {wordRush.currentWordIndex + 1}
          </span>
          {wordRush.roundRemainingSeconds !== null && (
            <span className="tabular-nums">{wordRush.roundRemainingSeconds}s left</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortByScore(wordRush.players).map((player) => (
            <div
              key={player.address}
              className="flex items-center justify-between rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm"
            >
              <span className="truncate text-nim-text">{shortAddress(player.address)}</span>
              <span className="font-semibold tabular-nums text-nim-accent">
                {player.score} pts
                <span className="ml-1 text-[11px] text-nim-text-muted">
                  {player.correct}/{player.incorrect}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-3xl font-extrabold tracking-tight text-nim-text">
          {wordRush.currentWord}
        </p>

        <div className="flex flex-col gap-2">
          <input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer…"
            autoComplete="off"
            disabled={submitting}
            className="rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm text-nim-text placeholder:text-nim-text-muted/60 focus:border-nim-primary/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg bg-nim-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit answer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-nim-border/60 bg-nim-surface-panel px-4 py-6 text-center">
      <span className="my-4 text-4xl text-nim-text-muted">
        <BoltIcon className="mx-auto h-10 w-10" />
      </span>
      <p className="text-sm text-nim-text-muted">Waiting for the next prompt…</p>
    </div>
  );
}
