import type { GameSessionMode } from "../../models/GameSession";
import type { WordRushDifficulty, WordRushScoringConfig } from "./config";
import { getWordRushConfig } from "./config";
import { buildRoundWords } from "./words";

export type WordRushSessionStatus = "created" | "countdown" | "active" | "completed";

export type WordRushRoundStatus = "active" | "completed";

export interface WordRushPlayerProgress {
  score: number;
  correct: number;
  incorrect: number;
  lastAnswerAt: Date | null;
  ready: boolean;
}

export interface WordRushAnswerRecord {
  round: number;
  word: string;
  player: string;
  answer: string;
  correct: boolean;
  points: number;
  submittedAt: Date;
}

export interface WordRushSessionState {
  mode: GameSessionMode;
  joinCode: string | null;
  requiredPlayers: number;
  readyPlayerAddresses: string[];
  difficulty: WordRushDifficulty;
  sessionStatus: WordRushSessionStatus;
  rounds: string[][];
  currentRound: number;
  roundStatus: WordRushRoundStatus | null;
  currentWordIndex: number;
  roundDurationSeconds: number;
  countdownSeconds: number;
  numberOfRounds: number;
  wordsPerRound: number;
  scoring: WordRushScoringConfig;
  players: Record<string, WordRushPlayerProgress>;
  answers: WordRushAnswerRecord[];
  roundStartedAt: Date | null;
  countdownStartedAt: Date | null;
  startedAt: Date | null;
  updatedAt: Date;
  completedAt: Date | null;
}

export function getCurrentPrompt(state: WordRushSessionState): string | null {
  const roundWords = state.rounds[state.currentRound - 1];
  if (!roundWords) {
    return null;
  }
  return roundWords[state.currentWordIndex] ?? null;
}

export function buildInitialState(
  difficulty: WordRushDifficulty,
  playerAddress: string,
  mode: GameSessionMode = "solo",
  joinCode: string | null = null,
  requiredPlayers: number = 1,
  readyPlayerAddresses: string[] = [],
): WordRushSessionState {
  const config = getWordRushConfig(difficulty);
  const rounds = Array.from(
    { length: config.numberOfRounds },
    (_, i) => buildRoundWords(difficulty, i + 1, config.wordsPerRound),
  );

  return {
    mode,
    joinCode,
    requiredPlayers,
    readyPlayerAddresses,
    difficulty,
    sessionStatus: "created",
    rounds,
    currentRound: 1,
    roundStatus: null,
    currentWordIndex: 0,
    roundDurationSeconds: config.roundDurationSeconds,
    countdownSeconds: config.countdownSeconds,
    numberOfRounds: config.numberOfRounds,
    wordsPerRound: config.wordsPerRound,
    scoring: structuredClone(config.scoring),
    players: {
      [playerAddress]: { score: 0, correct: 0, incorrect: 0, lastAnswerAt: null, ready: false },
    },
    answers: [],
    roundStartedAt: null,
    countdownStartedAt: null,
    startedAt: null,
    updatedAt: new Date(),
    completedAt: null,
  };
}

export interface WordRushPublicPlayerProgress {
  address: string;
  score: number;
  correct: number;
  incorrect: number;
  lastAnswerAt: Date | null;
}

export interface WordRushResultSummary {
  completed: boolean;
  score: number;
  correct: number;
  incorrect: number;
  winner: string | null;
}

export interface WordRushPublicState {
  difficulty: WordRushDifficulty;
  sessionStatus: WordRushSessionStatus;
  currentRound: number;
  roundStatus: WordRushRoundStatus | null;
  currentWordIndex: number;
  currentWord: string | null;
  roundDurationSeconds: number;
  countdownSeconds: number;
  numberOfRounds: number;
  wordsPerRound: number;
  players: WordRushPublicPlayerProgress[];
  answers: WordRushAnswerRecord[];
  roundStartedAt: Date | null;
  roundEndsAt: Date | null;
  roundRemainingSeconds: number | null;
  countdownEndsAt: Date | null;
  countdownRemainingSeconds: number | null;
  startedAt: Date | null;
  updatedAt: Date;
  completedAt: Date | null;
  result: WordRushResultSummary | null;
}

function phaseDeadline(state: WordRushSessionState, now: Date): {
  roundEndsAt: Date | null;
  countdownEndsAt: Date | null;
} {
  const roundEndsAt =
    state.sessionStatus === "active" && state.roundStartedAt !== null
      ? new Date(state.roundStartedAt.getTime() + state.roundDurationSeconds * 1000)
      : null;
  const countdownEndsAt =
    state.sessionStatus === "countdown" && state.countdownStartedAt !== null
      ? new Date(state.countdownStartedAt.getTime() + state.countdownSeconds * 1000)
      : null;
  return { roundEndsAt, countdownEndsAt };
}

function remainingSeconds(deadline: Date | null, now: Date): number | null {
  if (deadline === null) {
    return null;
  }
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 1000));
}

export function getWordRushResult(
  state: WordRushSessionState,
  viewerAddress: string,
): WordRushResultSummary | null {
  if (state.sessionStatus !== "completed") {
    return null;
  }

  const viewer = state.players[viewerAddress];
  const winnerEntry = Object.entries(state.players).sort(
    ([, a], [, b]) => b.score - a.score,
  )[0];

  return {
    completed: true,
    score: viewer?.score ?? 0,
    correct: viewer?.correct ?? 0,
    incorrect: viewer?.incorrect ?? 0,
    winner: winnerEntry ? winnerEntry[0] : null,
  };
}

export function toWordRushPublicState(
  state: WordRushSessionState,
  viewerAddress: string,
  now: Date = new Date(),
): WordRushPublicState {
  const { roundEndsAt, countdownEndsAt } = phaseDeadline(state, now);

  return {
    difficulty: state.difficulty,
    sessionStatus: state.sessionStatus,
    currentRound: state.currentRound,
    roundStatus: state.roundStatus,
    currentWordIndex: state.currentWordIndex,
    currentWord:
      state.sessionStatus === "active" && state.roundStatus === "active"
        ? getCurrentPrompt(state)
        : null,
    roundDurationSeconds: state.roundDurationSeconds,
    countdownSeconds: state.countdownSeconds,
    numberOfRounds: state.numberOfRounds,
    wordsPerRound: state.wordsPerRound,
    players: Object.entries(state.players).map(([address, progress]) => ({
      address,
      score: progress.score,
      correct: progress.correct,
      incorrect: progress.incorrect,
      lastAnswerAt: progress.lastAnswerAt,
    })),
    answers: state.answers.filter((record) => record.player === viewerAddress),
    roundStartedAt: state.roundStartedAt,
    roundEndsAt,
    roundRemainingSeconds: remainingSeconds(roundEndsAt, now),
    countdownEndsAt,
    countdownRemainingSeconds: remainingSeconds(countdownEndsAt, now),
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    completedAt: state.completedAt,
    result: getWordRushResult(state, viewerAddress),
  };
}