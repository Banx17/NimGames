import { Game } from "../models/Game";
import { GameSession } from "../models/GameSession";
import type { GameSessionDocument } from "../models/GameSession";
import { User } from "../models/User";
import type { GameDocument, GameStatus } from "../models/Game";

export interface GameDefinition {
  slug: string;
  name: string;
  description: string;
  status: GameStatus;
  icon: string;
  modes: string[];
}

export const INITIAL_GAMES: GameDefinition[] = [
  {
    slug: "word-rush",
    name: "Word Rush",
    description: "Race against the clock to find as many words as you can.",
    status: "available",
    icon: "word-rush",
    modes: ["solo", "duel"],
  },
  {
    slug: "dare",
    name: "Dare",
    description: "Take on dares and challenges with friends.",
    status: "coming-soon",
    icon: "dare",
    modes: ["party"],
  },
  {
    slug: "trivia-battle",
    name: "Trivia Battle",
    description: "Battle friends with rapid-fire trivia questions.",
    status: "coming-soon",
    icon: "trivia-battle",
    modes: ["duel", "tournament"],
  },
  {
    slug: "scrabble",
    name: "Scrabble",
    description: "Build words on the board in the classic word game.",
    status: "coming-soon",
    icon: "scrabble",
    modes: ["duel", "tournament"],
  },
];

export async function seedGames(): Promise<void> {
  await Promise.all(
    INITIAL_GAMES.map(({ slug, ...fields }) =>
      Game.updateOne(
        { _id: slug },
        { $setOnInsert: fields },
        { upsert: true },
      ),
    ),
  );
}

export interface GameResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: GameStatus;
  icon: string;
  modes: string[];
}

export function toGameResponse(game: GameDocument): GameResponse {
  return {
    id: game._id,
    slug: game._id,
    name: game.name,
    description: game.description,
    status: game.status,
    icon: game.icon,
    modes: game.modes,
  };
}

export type CreateGameSessionResult =
  | { ok: true; session: GameSessionDocument }
  | { ok: false; code: "game_not_found" | "game_not_available" | "user_not_found" };

export async function createGameSessionForUser(
  slug: string,
  address: string,
): Promise<CreateGameSessionResult> {
  const game = await Game.findById(slug);
  if (!game) {
    return { ok: false, code: "game_not_found" };
  }

  if (game.status !== "available") {
    return { ok: false, code: "game_not_available" };
  }

  const user = await User.findOne({ address });
  if (!user) {
    return { ok: false, code: "user_not_found" };
  }

  const session = await GameSession.create({
    game: game._id,
    players: [user.address],
  });

  return { ok: true, session };
}

export function toPublicGameSession(session: GameSessionDocument) {
  return {
    id: session._id.toString(),
    game: session.game,
    status: session.status,
    players: session.players,
    winner: session.winner,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  };
}