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
    const result = wordRush.result;
    const isTie = result?.tie === true;
    const winnerAddress = !isTie ? (result?.winner ?? null) : null;
    const isStaked = session.mode === "1v1" && wordRush.stake > 0;
    const pot = result?.pot ?? 0;
    const winnerPayout =
      winnerAddress !== null ? (result?.payouts[winnerAddress] ?? 0) : 0;

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

        {isStaked && result !== null && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm">
                <span className="text-nim-text">Pot</span>
                <span className="font-semibold tabular-nums text-nim-accent">
                  {pot} NIM
                </span>
              </div>

              {!isTie && winnerAddress !== null && (
                <div className="flex items-center justify-between rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm">
                  <span className="text-nim-text">Winner payout</span>
                  <span className="font-semibold tabular-nums text-nim-accent">
                    {winnerPayout} NIM
                  </span>
                </div>
              )}

              {isTie && (
                <div className="flex flex-col gap-1 rounded-lg border border-nim-border/60 bg-nim-surface px-3 py-2 text-sm">
                  <span className="font-semibold text-nim-text">It’s a tie</span>
                  <span className="text-xs text-nim-text-muted">
                    The pot is split equally between the tied players.
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-nim-text-muted">
              Payouts reflect the game result only — no NIM is transferred
              automatically.
            </p>
          </>
        )}

        <div className="flex flex-col gap-2">
          {sortByScore(wordRush.players).map((player) => {
            const payout = result?.payouts[player.address] ?? 0;
            const isWinner = winnerAddress !== null && player.address === winnerAddress;
            return (
              <div
                key={player.address}
                className={`flex items-center justify-between rounded-lg border bg-nim-surface px-3 py-2 text-sm ${
                  isWinner ? "border-nim-primary/40 bg-nim-primary/10" : "border-nim-border/60"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-nim-text">{shortAddress(player.address)}</span>
                  {isWinner && (
                    <span className="rounded-full bg-nim-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nim-accent">
                      Winner
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  {payout > 0 && (
                    <span className="rounded-full bg-nim-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nim-success">
                      +{payout} NIM
                    </span>
                  )}
                  <span className="font-semibold tabular-nums text-nim-accent">
                    {player.score} pts
                  </span>
                </span>
              </div>
            );
          })}
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
