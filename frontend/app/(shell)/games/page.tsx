import { GamesIcon } from "@/components/shell/icons";

export default function GamesPage() {
  return (
    <section className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <GamesIcon className="h-10 w-10 text-nim-text-muted" />
      <h2 className="text-lg font-semibold text-nim-text">Choose a game</h2>
      <p className="text-sm text-nim-text-muted">
        Word Rush is live. More games are coming soon.
      </p>
    </section>
  );
}
