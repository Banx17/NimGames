"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BoltIcon } from "@/components/shell/icons";
import type {
  WordRushSessionPublic,
  WordRushPlayerProgress,
} from "@/lib/wordRushClient";

interface GamePlayProps {
  session: WordRushSessionPublic;
  answer: string;
  feedback: {
    kind: "correct" | "incorrect";
    points: number;
    word: string;
  } | null;
  onAnswerChange: (answer: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onSendWord: (word: string) => void;
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
  feedback,
  onAnswerChange,
  submitting,
  onSubmit,
  onSendWord,
  onBack,
}: GamePlayProps) {
  const wordRush = session.wordRush;

  const isCompleted = wordRush.sessionStatus === "completed";
  const isCountdown = wordRush.sessionStatus === "countdown" || wordRush.countdownRemainingSeconds !== null;

  const boardLettersKey = wordRush.board?.letters.join("") ?? "";

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

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-nim-border/60 bg-nim-surface-panel p-5">
      <div className="flex items-center justify-between text-xs text-nim-text-muted">
        <span>Round {wordRush.currentRound}</span>
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

      <p className="text-center text-sm font-medium text-nim-text-muted">
        Find as many words as you can
      </p>

      {wordRush.board === null ? (
        <div className="flex flex-col gap-1 rounded-xl border border-nim-border/40 bg-nim-surface-dimmer/40 px-4 py-6 text-center">
          <BoltIcon className="mx-auto h-8 w-8 text-nim-text-muted" />
          <p className="text-sm text-nim-text-muted">Waiting for the board…</p>
        </div>
      ) : (
        <WordBoard
          key={`${wordRush.currentRound}-${boardLettersKey}`}
          board={wordRush.board}
          onSendWord={onSendWord}
        />
      )}

      {feedback !== null && (
        <div
          aria-live="polite"
          className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
            feedback.kind === "correct"
              ? "border-nim-success/40 bg-nim-success/10 text-nim-success"
              : "border-nim-error/40 bg-nim-error/10 text-nim-error"
          }`}
        >
          {feedback.kind === "correct" ? (
            <>
              Correct{feedback.points > 0 && <> · +{feedback.points} pts</>}
            </>
          ) : (
            <>That was incorrect</>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type a word…"
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
          {submitting ? "Submitting…" : "Submit word"}
        </button>
      </div>
    </div>
  );
}

function WordBoard({
  board,
  onSendWord,
}: {
  board: { letters: string[]; size: number };
  onSendWord: (word: string) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const selectedRef = useRef<number[]>([]);
  const draggingRef = useRef(false);

  const selectedWord = selected.map((index) => board.letters[index] ?? "").join("");

  function cellIndexAt(clientX: number, clientY: number): number | null {
    const element = document.elementFromPoint(clientX, clientY);
    const cell =
      element instanceof Element ? element.closest<HTMLElement>("[data-cell-index]") : null;
    const raw = cell?.dataset.cellIndex;
    if (raw === undefined || raw === "") {
      return null;
    }
    const index = Number(raw);
    return Number.isInteger(index) && index >= 0 ? index : null;
  }

  function isAdjacent(a: number, b: number): boolean {
    const size = board.size;
    const ax = a % size;
    const ay = Math.floor(a / size);
    const bx = b % size;
    const by = Math.floor(b / size);
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return dx <= 1 && dy <= 1 && (dx !== 0 || dy !== 0);
  }

  function resetSelection() {
    draggingRef.current = false;
    selectedRef.current = [];
    setSelected([]);
  }

  function handleSelectionPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>("[data-cell-index]");
    if (!cell) {
      return;
    }
    const index = Number(cell.dataset.cellIndex);
    if (!Number.isInteger(index) || index < 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    selectedRef.current = [index];
    setSelected([index]);
  }

  function handleSelectionPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) {
      return;
    }
    const index = cellIndexAt(event.clientX, event.clientY);
    if (index === null) {
      return;
    }
    const current = selectedRef.current;
    if (current.includes(index)) {
      return;
    }
    if (!isAdjacent(current[current.length - 1], index)) {
      return;
    }
    const next = [...current, index];
    selectedRef.current = next;
    setSelected(next);
  }

  function handleSelectionPointerUp() {
    if (!draggingRef.current) {
      return;
    }
    const word = selectedRef.current.map((i) => board.letters[i] ?? "").join("");
    resetSelection();
    if (word.length >= 3) {
      onSendWord(word);
    }
  }

  function handleSelectionPointerCancel() {
    resetSelection();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-11 items-center justify-center rounded-lg border border-nim-border/60 bg-nim-surface px-3">
        {selectedWord.length > 0 ? (
          <span className="text-2xl font-bold uppercase tracking-widest text-nim-accent">
            {selectedWord}
          </span>
        ) : (
          <span className="text-xs text-nim-text-muted">Swipe to select a word</span>
        )}
      </div>

      <div
        className="mx-auto grid w-full max-w-sm gap-2"
        style={{
          gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
          touchAction: "none",
        }}
        onPointerDown={handleSelectionPointerDown}
        onPointerMove={handleSelectionPointerMove}
        onPointerUp={handleSelectionPointerUp}
        onPointerCancel={handleSelectionPointerCancel}
      >
        {board.letters.map((letter, index) => {
          const isSelected = selected.includes(index);
          return (
            <div
              key={index}
              data-cell-index={index}
              className={`flex aspect-square select-none touch-none cursor-pointer items-center justify-center rounded-lg border text-xl font-bold uppercase tracking-wide transition-colors ${
                isSelected
                  ? "border-nim-primary/70 bg-nim-primary/25 text-nim-accent"
                  : "border-nim-border/60 bg-nim-surface text-nim-text"
              }`}
              aria-label={letter.toUpperCase()}
            >
              {letter.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
