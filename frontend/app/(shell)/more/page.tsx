import { MoreIcon } from "@/components/shell/icons";

export default function MorePage() {
  return (
    <section className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <MoreIcon className="h-10 w-10 text-nim-text-muted" />
      <h2 className="text-lg font-semibold text-nim-text">More</h2>
      <p className="text-sm text-nim-text-muted">
        Settings and extras are on the way.
      </p>
    </section>
  );
}
