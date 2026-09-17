"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { BoltIcon } from "@/components/shell/icons";
import {
  createWordRushSession,
  getWordRushSession,
  joinWordRushSession,
  loadWordRushSession,
  setWordRushReady,
  startWordRushSession,
  submitWordRushAnswer,
  type WordRushDifficulty,
  type WordRushGameMode,
  type WordRushSessionPublic,
} from "@/lib/wordRushClient";
import { CreateLobby, GameLobby } from "./lobby";
import { GamePlay } from "./gameplay";

export default function WordRushPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<WordRushDifficulty>("easy");
  const [mode, setMode] = useState<WordRushGameMode>("solo");
  const [stake, setStake] = useState("");
  const [session, setSession] = useState<WordRushSessionPublic | null>(null);

  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const [ready, setReady] = useState(false);
  const [readyPending, setReadyPending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLobby =
    session !== null &&
    session.mode === "1v1" &&
    (session.wordRush.sessionStatus === "created" ||
      session.wordRush.sessionStatus === "countdown");

  async function handleMarkReady() {
    if (!session || readyPending) return;
    setReadyPending(true);
    try {
      const { session: updated } = await setWordRushReady(session.id, true);
      setSession(updated);
      setReady(true);
    } catch (err) {
      setResultMessage({
        kind: "error",
        text: err instanceof ApiError ? err.message : "Could not mark ready.",
      });
    } finally {
      setReadyPending(false);
    }
  }

  async function handleStart() {
    if (!session) return;
    try {
      const { session: started } = await startWordRushSession(session.id);
      setSession(started);
    } catch (err) {
      setResultMessage({
        kind: "error",
        text: err instanceof ApiError ? err.message : "Could not start session.",
      });
    }
  }

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    const pollSessionId = session.id;

    async function poll() {
      try {
        const { session: updated } = await getWordRushSession(pollSessionId);
        if (!cancelled) setSession(updated);
      } catch {
        // transient network blip — keep last known state and retry next tick
      }
    }

    poll();
    const timer = window.setInterval(poll, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session, isLobby]);

  async function handleCreate() {
    try {
      const stakeValue =
        mode === "1v1" && Number.isFinite(Number(stake)) && Number(stake) > 0
          ? Math.floor(Number(stake))
          : 0;
      const { session: created } = await createWordRushSession(
        difficulty,
        mode,
        stakeValue,
      );
      setSession(created);

      if (mode === "solo") {
        await startWordRushSession(created.id);
      }
    } catch (err) {
      setResultMessage({
        kind: "error",
        text: err instanceof ApiError ? err.message : "Could not create session.",
      });
    }
  }

  async function handleJoin(code: string) {
    try {
      const { session: joined } = await joinWordRushSession(code);
      setSession(joined);
    } catch (err) {
      setResultMessage({
        kind: "error",
        text: err instanceof ApiError ? err.message : "Could not join session.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-nim-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nim-accent">
          <BoltIcon className="h-3.5 w-3.5" />
          Word Rush
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-nim-text">
          Word Rush
        </h1>
        <p className="text-sm text-nim-text-muted">
          Race against the clock — find the correct word before the seconds run
          out. Winner takes the pot on the Nimiq blockchain.
        </p>
      </header>

      {!session && (
        <CreateLobby
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          mode={mode}
          onModeChange={setMode}
          stake={stake}
          onStakeChange={setStake}
          onCreate={handleCreate}
          onJoin={handleJoin}
          user={user}
          router={router}
        />
      )}

      {session && isLobby && (
        <GameLobby
          session={session}
          answer={answer}
          onAnswerChange={setAnswer}
          submitting={submitting}
          onSubmit={() => {
            void submitAnswer(session, answer, setSubmitting, setResultMessage, setSession);
          }}
          ready={ready}
          onReadyChange={setReady}
          readyPending={readyPending}
          onMarkReady={handleMarkReady}
          onStart={handleStart}
        />
      )}

      {session && !isLobby && (
        <GamePlay
          session={session}
          answer={answer}
          onAnswerChange={setAnswer}
          submitting={submitting}
          onSubmit={() => {
            void submitAnswer(session, answer, setSubmitting, setResultMessage, setSession);
          }}
          onBack={() => router.push("/games")}
        />
      )}

      {resultMessage && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            resultMessage.kind === "error"
              ? "bg-nim-error/10 text-nim-error"
              : "bg-nim-success/10 text-nim-success"
          }`}
        >
          {resultMessage.text}
        </p>
      )}
    </div>
  );
}

async function submitAnswer(
  session: WordRushSessionPublic,
  answer: string,
  setSubmitting: (v: boolean) => void,
  setResultMessage: (v: { kind: "success" | "error"; text: string } | null) => void,
  setSession: (s: WordRushSessionPublic) => void,
): Promise<void> {
  if (answer.trim().length === 0) {
    return;
  }
  setSubmitting(true);
  try {
    const { session: updated } = await submitWordRushAnswer(
      session.id,
      answer.trim(),
      session.wordRush.currentRound,
      session.wordRush.currentWordIndex,
    );
    setSession(updated);
  } catch (err) {
    setResultMessage({
      kind: "error",
      text: err instanceof ApiError ? err.message : "Could not submit answer.",
    });
  } finally {
    setSubmitting(false);
  }
}
