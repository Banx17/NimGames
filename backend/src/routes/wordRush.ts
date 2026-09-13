import { Router } from "express";
import type { Response } from "express";
import mongoose from "mongoose";
import { GameSession } from "../models/GameSession";
import type { GameSessionDocument } from "../models/GameSession";
import { createGameSessionForUser, toPublicGameSession } from "../lib/games";
import { DEFAULT_WORD_RUSH_DIFFICULTY, isWordRushDifficulty } from "../lib/wordRush/config";
import type { WordRushDifficulty } from "../lib/wordRush/config";
import type { WordRushGameErrorCode } from "../lib/wordRush/service";
import {
  getWordRushView,
  initializeWordRushGame,
  isWordRushSession,
  refreshWordRushGame,
  startWordRushGame,
  submitWordRushAnswer,
} from "../lib/wordRush/service";
import { requireAuth } from "../middleware/requireAuth";
import type { AuthedRequest } from "../middleware/requireAuth";

const router = Router();

const GAME_ERROR_CODES: Record<WordRushGameErrorCode, { status: number; message: string }> = {
  not_found: { status: 404, message: "Session not found" },
  invalid_transition: { status: 409, message: "Game has already been started" },
  not_started: { status: 409, message: "Game has not started yet" },
  countdown: { status: 409, message: "Game is still in countdown" },
  completed: { status: 409, message: "Game has already completed" },
  stale_word: { status: 409, message: "Answer is stale or a duplicate" },
  no_current_word: { status: 409, message: "No active prompt is available" },
};

function sendGameError(res: Response, code: WordRushGameErrorCode): void {
  const { status, message } = GAME_ERROR_CODES[code];
  res.status(status).json({ error: { message, code } });
}

async function loadOwnedWordRushSession(
  sessionId: string,
  address: string,
): Promise<GameSessionDocument | null> {
  if (!mongoose.isValidObjectId(sessionId)) {
    return null;
  }

  const session = await GameSession.findById(sessionId);
  if (!session || !isWordRushSession(session)) {
    return null;
  }

  if (!session.players.includes(address)) {
    return null;
  }

  return session;
}

function wordRushSessionResponse(session: GameSessionDocument, address: string) {
  return {
    ...toPublicGameSession(session),
    wordRush: getWordRushView(session, address),
  };
}

router.post("/sessions", requireAuth, async (req: AuthedRequest, res) => {
  const difficulty = (req.body ?? {}).difficulty;
  if (difficulty !== undefined && !isWordRushDifficulty(difficulty)) {
    res.status(400).json({ error: { message: "Unknown difficulty" } });
    return;
  }

  const created = await createGameSessionForUser("word-rush", req.auth!.address);

  if (!created.ok) {
    if (created.code === "game_not_found") {
      res.status(404).json({ error: { message: "Game not found" } });
    } else if (created.code === "game_not_available") {
      res.status(409).json({ error: { message: "Game is not available yet" } });
    } else {
      res.status(401).json({ error: { message: "Not authenticated" } });
    }
    return;
  }

  const session = await initializeWordRushGame(
    created.session,
    (difficulty as WordRushDifficulty | undefined) ?? DEFAULT_WORD_RUSH_DIFFICULTY,
  );

  res.status(201).json({ session: wordRushSessionResponse(session, req.auth!.address) });
});

router.post("/sessions/:sessionId/start", requireAuth, async (req: AuthedRequest, res) => {
  const session = await loadOwnedWordRushSession(
    String(req.params.sessionId),
    req.auth!.address,
  );

  if (!session) {
    res.status(404).json({ error: { message: "Session not found" } });
    return;
  }

  const result = await startWordRushGame(session);
  if (!result.ok) {
    sendGameError(res, result.code);
    return;
  }

  res.json({ session: wordRushSessionResponse(session, req.auth!.address) });
});

router.get("/sessions/:sessionId", requireAuth, async (req: AuthedRequest, res) => {
  const session = await loadOwnedWordRushSession(
    String(req.params.sessionId),
    req.auth!.address,
  );

  if (!session) {
    res.status(404).json({ error: { message: "Session not found" } });
    return;
  }

  const refreshed = await refreshWordRushGame(session);
  if (!refreshed.ok) {
    res.status(404).json({ error: { message: "Session not found" } });
    return;
  }

  res.json({ session: wordRushSessionResponse(session, req.auth!.address) });
});

router.post("/sessions/:sessionId/answer", requireAuth, async (req: AuthedRequest, res) => {
  const { answer, round, wordIndex } = req.body ?? {};
  if (typeof answer !== "string" || answer.trim().length === 0 || answer.trim().length > 64) {
    res.status(400).json({ error: { message: "Invalid answer" } });
    return;
  }
  if (typeof round !== "number" || !Number.isInteger(round) || round < 1) {
    res.status(400).json({ error: { message: "Invalid round" } });
    return;
  }
  if (typeof wordIndex !== "number" || !Number.isInteger(wordIndex) || wordIndex < 0) {
    res.status(400).json({ error: { message: "Invalid word index" } });
    return;
  }

  const session = await loadOwnedWordRushSession(
    String(req.params.sessionId),
    req.auth!.address,
  );
  if (!session) {
    res.status(404).json({ error: { message: "Session not found" } });
    return;
  }

  const result = await submitWordRushAnswer(
    session,
    req.auth!.address,
    answer,
    round,
    wordIndex,
  );

  if (!result.ok) {
    sendGameError(res, result.code);
    return;
  }

  res.json({
    answer: { correct: result.correct, points: result.points },
    sessionCompleted: result.sessionCompleted,
    session: wordRushSessionResponse(session, req.auth!.address),
  });
});

export default router;