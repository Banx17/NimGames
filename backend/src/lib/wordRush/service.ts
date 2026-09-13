import type { GameSessionDocument } from "../../models/GameSession";
import type { WordRushDifficulty } from "./config";
import { buildInitialState, getCurrentPrompt, toWordRushPublicState } from "./state";
import type { WordRushPlayerProgress, WordRushPublicState, WordRushSessionState } from "./state";

type StoredSession = GameSessionDocument & {
  markModified(path: string): unknown;
  save(): Promise<GameSessionDocument>;
};

function toStoredSession(session: GameSessionDocument): StoredSession {
  return session as unknown as StoredSession;
}

function pickWinner(
  players: Record<string, WordRushPlayerProgress>,
): string | null {
  const entry = Object.entries(players).sort(([, a], [, b]) => b.score - a.score)[0];
  return entry ? entry[0] : null;
}

function completeGame(state: WordRushSessionState, session: GameSessionDocument, now: Date): void {
  state.sessionStatus = "completed";
  state.roundStatus = "completed";
  state.completedAt = now;
  state.updatedAt = now;
  session.status = "completed";
  session.completedAt = now;
  session.winner = pickWinner(state.players);
}

export function isWordRushSession(session: GameSessionDocument): boolean {
  return getWordRushState(session) !== null;
}

export function getWordRushState(session: GameSessionDocument): WordRushSessionState | null {
  const wordRush = (session.state as Record<string, unknown>).wordRush;
  if (wordRush === undefined || wordRush === null) {
    return null;
  }
  return wordRush as WordRushSessionState;
}

export function getWordRushView(
  session: GameSessionDocument,
  viewerAddress: string,
  now: Date = new Date(),
): WordRushPublicState | null {
  const state = getWordRushState(session);
  return state ? toWordRushPublicState(state, viewerAddress, now) : null;
}

export async function initializeWordRushGame(
  session: GameSessionDocument,
  difficulty: WordRushDifficulty,
): Promise<GameSessionDocument> {
  const stored = toStoredSession(session);
  const playerAddress = stored.players[0];
  (stored.state as Record<string, unknown>).wordRush = buildInitialState(
    difficulty,
    playerAddress,
  );
  stored.markModified("state");
  await stored.save();
  return stored;
}

export type WordRushGameErrorCode =
  | "not_found"
  | "invalid_transition"
  | "not_started"
  | "countdown"
  | "completed"
  | "stale_word"
  | "no_current_word";

function applyTimeTransitions(
  state: WordRushSessionState,
  session: GameSessionDocument,
  now: Date,
): boolean {
  let changed = false;

  if (
    state.sessionStatus === "countdown" &&
    state.countdownStartedAt !== null &&
    now.getTime() >= state.countdownStartedAt.getTime() + state.countdownSeconds * 1000
  ) {
    state.sessionStatus = "active";
    state.roundStatus = "active";
    state.roundStartedAt = now;
    changed = true;
  }

  if (
    state.sessionStatus === "active" &&
    state.roundStartedAt !== null &&
    now.getTime() >= state.roundStartedAt.getTime() + state.roundDurationSeconds * 1000
  ) {
    if (state.currentRound < state.numberOfRounds) {
      state.currentRound += 1;
      state.currentWordIndex = 0;
      state.roundStartedAt = now;
    } else {
      completeGame(state, session, now);
    }
    changed = true;
  }

  if (changed) {
    state.updatedAt = now;
  }
  return changed;
}

export type RefreshGameResult =
  | { ok: true }
  | { ok: false; code: "not_found" };

export async function refreshWordRushGame(
  session: GameSessionDocument,
  now: Date = new Date(),
): Promise<RefreshGameResult> {
  const stored = toStoredSession(session);
  const state = getWordRushState(session);
  if (!state) {
    return { ok: false, code: "not_found" };
  }

  const changed = applyTimeTransitions(state, session, now);
  if (changed) {
    stored.markModified("state");
    await stored.save();
  }
  return { ok: true };
}

export type StartGameResult =
  | { ok: true }
  | { ok: false; code: "not_found" | "invalid_transition" };

export async function startWordRushGame(
  session: GameSessionDocument,
  now: Date = new Date(),
): Promise<StartGameResult> {
  const stored = toStoredSession(session);
  const state = getWordRushState(session);
  if (!state) {
    return { ok: false, code: "not_found" };
  }

  if (state.sessionStatus !== "created") {
    return { ok: false, code: "invalid_transition" };
  }

  state.sessionStatus = "countdown";
  state.countdownStartedAt = now;
  state.startedAt = now;
  state.updatedAt = now;
  session.status = "active";
  session.startedAt = now;

  stored.markModified("state");
  await stored.save();
  return { ok: true };
}

export type SubmitAnswerResult =
  | {
      ok: true;
      correct: boolean;
      points: number;
      sessionCompleted: boolean;
      state: WordRushPublicState;
    }
  | { ok: false; code: WordRushGameErrorCode };

export async function submitWordRushAnswer(
  session: GameSessionDocument,
  playerAddress: string,
  rawAnswer: string,
  claimedRound: number,
  claimedWordIndex: number,
): Promise<SubmitAnswerResult> {
  const stored = toStoredSession(session);
  const state = getWordRushState(session);
  if (!state) {
    return { ok: false, code: "not_found" };
  }

  const now = new Date();
  applyTimeTransitions(state, session, now);

  if (state.sessionStatus === "created") {
    return { ok: false, code: "not_started" };
  }
  if (state.sessionStatus === "countdown") {
    return { ok: false, code: "countdown" };
  }
  if (state.sessionStatus === "completed") {
    return { ok: false, code: "completed" };
  }

  const word = getCurrentPrompt(state);
  if (word === null || state.roundStatus !== "active" || state.roundStartedAt === null) {
    return { ok: false, code: "no_current_word" };
  }

  if (claimedRound !== state.currentRound || claimedWordIndex !== state.currentWordIndex) {
    return { ok: false, code: "stale_word" };
  }

  const answer = rawAnswer.trim();
  if (answer.length === 0) {
    return { ok: false, code: "no_current_word" };
  }

  const correct = answer.toLowerCase() === word.toLowerCase();
  const points = correct ? state.scoring.pointsPerCorrect : -state.scoring.wrongAnswerPenalty;

  const round = state.currentRound;
  const player: WordRushPlayerProgress =
    state.players[playerAddress] ??
    { score: 0, correct: 0, incorrect: 0, lastAnswerAt: null };
  player.score += points;
  if (correct) {
    player.correct += 1;
  } else {
    player.incorrect += 1;
  }
  player.lastAnswerAt = now;
  state.players[playerAddress] = player;

  state.answers.push({ round, word, player: playerAddress, answer, correct, points, submittedAt: now });

  let sessionCompleted = false;
  const roundWords = state.rounds[state.currentRound - 1];
  const roundFinished =
    roundWords !== undefined && state.currentWordIndex + 1 >= roundWords.length;

  if (roundFinished) {
    if (state.currentRound < state.numberOfRounds) {
      state.currentRound += 1;
      state.currentWordIndex = 0;
      state.roundStartedAt = now;
    } else {
      completeGame(state, session, now);
      sessionCompleted = true;
    }
  } else {
    state.currentWordIndex += 1;
  }

  state.updatedAt = now;
  stored.markModified("state");
  await stored.save();

  return {
    ok: true,
    correct,
    points,
    sessionCompleted,
    state: toWordRushPublicState(state, playerAddress, now),
  };
}