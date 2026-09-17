import { apiFetch } from "./api";
import { getAuthToken } from "./auth/authToken";

export type WordRushDifficulty = "easy" | "medium" | "hard";
export type WordRushGameMode = "solo" | "1v1";

export type WordRushPuslikeSessionStatus =
  | "created"
  | "countdown"
  | "active"
  | "completed";

export type WordRushRoundStatus = "active" | "completed";

export interface WordRushPlayerProgress {
  address: string;
  score: number;
  correct: number;
  incorrect: number;
  lastAnswerAt: string | null;
  ready: boolean;
}

export interface WordRushAnswerRecord {
  round: number;
  word: string;
  player: string;
  answer: string;
  correct: boolean;
  points: number;
  submittedAt: string;
}

export interface WordRushPublicState {
  difficulty: WordRushDifficulty;
  mode: WordRushGameMode;
  stake: number;
  requiredPlayers: number;
  readyPlayerAddresses: string[];
  canStartReady: boolean;
  sessionStatus: WordRushPuslikeSessionStatus;
  currentRound: number;
  roundStatus: WordRushRoundStatus | null;
  currentWordIndex: number;
  currentWord: string | null;
  roundDurationSeconds: number;
  countdownSeconds: number;
  numberOfRounds: number;
  wordsPerRound: number;
  roundStartedAt: string | null;
  roundEndsAt: string | null;
  roundRemainingSeconds: number | null;
  countdownEndsAt: string | null;
  countdownRemainingSeconds: number | null;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
  players: WordRushPlayerProgress[];
  answers: WordRushAnswerRecord[];
  result: {
    completed: boolean;
    score: number;
    correct: number;
    incorrect: number;
    winner: string | null;
  } | null;
}

export interface WordRushSessionPublic {
  id: string;
  game: string;
  mode: WordRushGameMode;
  joinCode: string | null;
  status: string;
  currentPlayerAddress: string;
  players: string[];
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  wordRush: WordRushPublicState;
}

export interface WordRushSessionResponse {
  session: WordRushSessionPublic;
}

export function createWordRushSession(
  difficulty: WordRushDifficulty,
  mode: WordRushGameMode,
  stake = 0,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>("/api/games/word-rush/sessions", {
    method: "POST",
    body: { difficulty, mode, ...(stake > 0 ? { stake } : {}) },
    token: getAuthToken(),
  });
}

export function loadWordRushSession(
  sessionId: string,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>(
    `/api/games/word-rush/sessions/${sessionId}/start`,
    { method: "POST", token: getAuthToken() },
  );
}

export function getWordRushSession(
  sessionId: string,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>(
    `/api/games/word-rush/sessions/${sessionId}`,
    { token: getAuthToken() },
  );
}

export function startWordRushSession(
  sessionId: string,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>(
    `/api/games/word-rush/sessions/${sessionId}/start`,
    { method: "POST", token: getAuthToken() },
  );
}

export function joinWordRushSession(
  joinCode: string,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>(
    "/api/games/word-rush/sessions/join",
    { method: "POST", body: { joinCode }, token: getAuthToken() },
  );
}

export function setWordRushReady(
  sessionId: string,
  ready: boolean,
): Promise<WordRushSessionResponse> {
  return apiFetch<WordRushSessionResponse>(
    `/api/games/word-rush/sessions/${sessionId}/ready`,
    { method: "POST", body: { ready }, token: getAuthToken() },
  );
}

export interface SubmitWordRushAnswerResponse extends WordRushSessionResponse {
  answer: { correct: boolean; points: number };
  sessionCompleted: boolean;
}

export function submitWordRushAnswer(
  sessionId: string,
  answer: string,
  round: number,
  wordIndex: number,
): Promise<SubmitWordRushAnswerResponse> {
  return apiFetch<SubmitWordRushAnswerResponse>(
    `/api/games/word-rush/sessions/${sessionId}/answer`,
    {
      method: "POST",
      body: { answer, round, wordIndex },
      token: getAuthToken(),
    },
  );
}
