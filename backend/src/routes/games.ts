import { Router } from "express";
import { Game } from "../models/Game";
import type { GameSessionDocument } from "../models/GameSession";
import { createGameSessionForUser, toGameResponse } from "../lib/games";
import { requireAuth } from "../middleware/requireAuth";
import type { AuthedRequest } from "../middleware/requireAuth";

const router = Router();

function toSessionResponse(session: GameSessionDocument) {
  return {
    id: session._id.toString(),
    game: session.game,
    status: session.status,
    players: session.players,
    winner: session.winner,
    state: session.state,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  };
}

router.get("/", async (_req, res) => {
  const games = await Game.find().sort({ _id: 1 }).lean();
  res.json({ games: games.map(toGameResponse) });
});

router.get("/:slug", async (req, res) => {
  const game = await Game.findById(req.params.slug).lean();

  if (!game) {
    res.status(404).json({ error: { message: "Game not found" } });
    return;
  }

  res.json({ game: toGameResponse(game) });
});

router.post("/:slug/sessions", requireAuth, async (req: AuthedRequest, res) => {
  const result = await createGameSessionForUser(String(req.params.slug), req.auth!.address);

  if (!result.ok) {
    if (result.code === "game_not_found") {
      res.status(404).json({ error: { message: "Game not found" } });
    } else if (result.code === "game_not_available") {
      res.status(409).json({ error: { message: "Game is not available yet" } });
    } else {
      res.status(401).json({ error: { message: "Not authenticated" } });
    }
    return;
  }

  res.status(201).json({ session: toSessionResponse(result.session) });
});

export default router;