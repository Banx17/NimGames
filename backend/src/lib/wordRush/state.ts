import type { GameSessionMode } from "../../models/GameSession";
import type { WordRushDifficulty, WordRushScoringConfig } from "./config";
import { getWordRushConfig } from "./config";
import { generateRoundBoard } from "./board";
import type { WordRushBoard } from "./board";

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

export interface WordRushOutcome {
  winner: string | null;
  tie: boolean;
}

export interface WordRushSessionState {
  mode: GameSessionMode;
  stake: number;
  joinCode: string | null;
  requiredPlayers: number;
  readyPlayerAddresses: string[];
  difficulty: WordRushDifficulty;
  sessionStatus: WordRushSessionStatus;
  rounds: WordRushBoard[];
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
  foundWords: Record<number, Record<string, string[]>>;
  roundStartedAt: Date | null;
  countdownStartedAt: Date | null;
  startedAt: Date | null;
  updatedAt: Date;
  completedAt: Date | null;
  outcome: WordRushOutcome | null;
}

export function getCurrentRoundBoard(state: WordRushSessionState): WordRushBoard | null {
  return state.rounds[state.currentRound - 1] ?? null;
}

export function getCurrentPrompt(state: WordRushSessionState): string | null {
  return null;
}

export function buildInitialState(
  difficulty: WordRushDifficulty,
  playerAddress: string,
  mode: GameSessionMode = "solo",
  joinCode: string | null = null,
  requiredPlayers: number = 1,
  readyPlayerAddresses: string[] = [],
  stake = 0,
): WordRushSessionState {
  const config = getWordRushConfig(difficulty);
  const rounds = Array.from(
    { length: config.numberOfRounds },
    () => generateRoundBoard(difficulty),
  );

  return {
    mode,
    stake,
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
    foundWords: {},
    roundStartedAt: null,
    countdownStartedAt: null,
    startedAt: null,
    updatedAt: new Date(),
    completedAt: null,
    outcome: null,
  };
}

export function computeWordRushPot(state: WordRushSessionState): number {
  return state.mode === "1v1" ? state.stake * 2 : 0;
}

export function deriveWordRushPayouts(state: WordRushSessionState): Record<string, number> {
  const pot = computeWordRushPot(state);
  if (pot === 0 || state.outcome === null) {
    return {};
  }

  const payouts: Record<string, number> = {};
  for (const address of Object.keys(state.players)) {
    payouts[address] = 0;
  }

  if (state.outcome.tie) {
    const highestScore = Math.max(...Object.values(state.players).map((player) => player.score));
    const tiedAddresses = Object.entries(state.players)
      .filter(([, player]) => player.score === highestScore)
      .map(([address]) => address);
    const split = tiedAddresses.length > 0 ? pot / tiedAddresses.length : 0;
    for (const address of tiedAddresses) {
      payouts[address] += split;
    }
  } else if (state.outcome.winner !== null) {
    payouts[state.outcome.winner] = pot;
  }

  return payouts;
}

export interface WordRushPublicPlayerProgress {
  address: string;
  score: number;
  correct: number;
  incorrect: number;
  lastAnswerAt: Date | null;
  ready: boolean;
}

export interface WordRushResultSummary {
  completed: boolean;
  score: number;
  correct: number;
  incorrect: number;
  winner: string | null;
  tie: boolean;
  pot: number;
  payouts: Record<string, number>;
}

export interface WordRushPublicBoard {
  letters: string[];
  size: number;
}

export interface WordRushPublicState {
  currentPlayerAddress: string;
  difficulty: WordRushDifficulty;
  stake: number;
  sessionStatus: WordRushSessionStatus;
  currentRound: number;
  roundStatus: WordRushRoundStatus | null;
  currentWordIndex: number;
  currentWord: string | null;
  board: WordRushPublicBoard | null;
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
  mode: GameSessionMode;
  requiredPlayers: number;
  readyPlayerAddresses: string[];
  canStartReady: boolean;
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

  return {
    completed: true,
    score: viewer?.score ?? 0,
    correct: viewer?.correct ?? 0,
    incorrect: viewer?.incorrect ?? 0,
    winner: state.outcome?.winner ?? null,
    tie: state.outcome?.tie ?? false,
    pot: computeWordRushPot(state),
    payouts: deriveWordRushPayouts(state),
  };
}

export function computeCanStartReady(state: WordRushSessionState): boolean {
  if (state.mode !== "1v1" || state.sessionStatus !== "created") {
    return false;
  }
  if (Object.keys(state.players).length < state.requiredPlayers) {
    return false;
  }
  return state.readyPlayerAddresses.length >= state.requiredPlayers;
}

export function toWordRushPublicState(
  state: WordRushSessionState,
  viewerAddress: string,
  now: Date = new Date(),
): WordRushPublicState {
  const { roundEndsAt, countdownEndsAt } = phaseDeadline(state, now);

  return {
    currentPlayerAddress: viewerAddress,
    difficulty: state.difficulty,
    stake: state.stake,
    mode: state.mode,
    requiredPlayers: state.requiredPlayers,
    readyPlayerAddresses: state.readyPlayerAddresses,
    canStartReady: computeCanStartReady(state),
    sessionStatus: state.sessionStatus,
    currentRound: state.currentRound,
    roundStatus: state.roundStatus,
    currentWordIndex: state.currentWordIndex,
    currentWord: null,
    board:
      state.sessionStatus === "active" && state.roundStatus === "active"
        ? (() => {
            const currentBoard = state.rounds[state.currentRound - 1];
            return currentBoard
              ? { letters: [...currentBoard.letters], size: currentBoard.size }
              : null;
          })()
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
      ready: progress.ready,
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