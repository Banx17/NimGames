import { randomInt } from "node:crypto";
import { Game } from "../models/Game";
import { GameSession } from "../models/GameSession";
import type { GameSessionDocument, GameSessionMode } from "../models/GameSession";
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

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 6;

function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateJoinCode();
    const existing = await GameSession.findOne({ joinCode: code });
    if (!existing) {
      return code;
    }
    if (attempt === 4) {
      return code;
    }
  }
  return generateJoinCode();
}

export async function createGameSessionForUser(
  slug: string,
  address: string,
  mode: GameSessionMode = "solo",
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

  const joinCode = mode === "1v1" ? await generateUniqueJoinCode() : null;

  const session = await GameSession.create({
    game: game._id,
    mode,
    joinCode,
    players: [user.address],
  });

  return { ok: true, session };
}

export function toPublicGameSession(session: GameSessionDocument) {
  return {
    id: session._id.toString(),
    game: session.game,
    mode: session.mode,
    joinCode: session.joinCode,
    status: session.status,
    players: session.players,
    winner: session.winner,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  };
}