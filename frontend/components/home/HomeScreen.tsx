"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNimiq } from "@/lib/nimiq/NimiqProvider";
import {
  BoltIcon,
  ChevronRightIcon,
  TrophyIcon,
} from "@/components/shell/icons";

interface GameResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "available" | "coming-soon";
  icon: string;
  modes: string[];
}

interface GamesResponse {
  games: GameResponse[];
}

const FEATURED_GAME_SLUG = "word-rush";

export function HomeScreen() {
  const { status: authStatus, login } = useAuth();
  const nimiq = useNimiq();
  const [games, setGames] = useState<GameResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<GamesResponse>("/api/games")
      .then(({ games: list }) => {
        if (!cancelled) {
          setGames(list);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not load games.";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured =
    games?.find((game) => game.slug === FEATURED_GAME_SLUG) ?? null;
  const others = games?.filter((game) => game.slug !== FEATURED_GAME_SLUG) ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <section className="overflow-hidden rounded-2xl border border-nim-border-strong bg-nim-bg-deep p-5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-nim-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nim-accent">
            <BoltIcon className="h-3.5 w-3.5" />
            Word Rush
          </span>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-nim-text">
            Game night, but make it competitive.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-nim-text-secondary">
            Challenge a friend to a rapid-fire word duel. Winner takes the pot —
            settled on the Nimiq blockchain.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/games/${featured?.slug ?? FEATURED_GAME_SLUG}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-nim-primary px-4 py-3 text-sm font-semibold text-nim-white transition-colors hover:bg-nim-primary-strong"
          >
            Challenge a friend
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          {authStatus !== "authenticated" && (
            <button
              type="button"
              onClick={login}
              disabled={nimiq.status === "loading"}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-nim-border-strong bg-nim-surface px-4 py-3 text-sm font-medium text-nim-text-muted transition-colors hover:bg-nim-raised hover:text-nim-text"
            >
              Connect wallet to play
            </button>
          )}
        </div>
      </section>

      <section aria-labelledby="games-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="games-heading" className="text-lg font-bold tracking-tight text-nim-white">
            Choose a game
          </h2>
          <Link
            href="/games"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-nim-text-muted transition-colors hover:text-nim-text"
          >
            See all
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error && (
          <p className="rounded-lg bg-nim-error/10 px-3 py-2 text-sm text-nim-error">
            {error}
          </p>
        )}

        {!games && !error && (
          <div className="space-y-2" role="status" aria-label="Loading games">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border border-nim-border bg-nim-surface"
              />
            ))}
          </div>
        )}

        {games &&
          (featured || others.length > 0) && (
            <ul className="flex flex-col gap-2.5">
              {featured && <GameCard game={featured} featured />}
              {others.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </ul>
          )}

        {games && !featured && others.length === 0 && (
          <p className="text-sm text-nim-text-muted">No games yet.</p>
        )}
      </section>
    </div>
  );
}

interface GameCardProps {
  game: GameResponse;
  featured?: boolean;
}

function GameCard({ game, featured = false }: GameCardProps) {
  const available = game.status === "available";
  const Icon = available ? BoltIcon : TrophyIcon;

  return (
    <li>
      <Link
        href={available ? `/games/${game.slug}` : "#"}
        aria-disabled={!available}
        className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-colors ${
          available
            ? "border-nim-border-strong bg-nim-surface hover:border-nim-border-stronger hover:bg-nim-raised"
            : "border-nim-border bg-nim-bg-deep opacity-60"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            available ? "bg-nim-primary/15 text-nim-accent" : "bg-nim-surface text-nim-text-muted"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-nim-text">{game.name}</span>
            {featured && (
              <span className="rounded-full bg-nim-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nim-accent">
                Featured
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-nim-text-muted">
            {game.description}
          </span>
        </span>
        <span
          className={`text-[11px] font-medium ${
            available ? "text-nim-success" : "text-nim-text-muted"
          }`}
        >
          {available ? "Available" : "Coming soon"}
        </span>
      </Link>
    </li>
  );
}
