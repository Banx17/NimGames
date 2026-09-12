import { NimiqStatus } from "@/components/NimiqStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8">
      <h1 className="text-2xl font-semibold">NimGames</h1>
      <p className="text-zinc-500">Games are coming soon.</p>
      <NimiqStatus />
    </main>
  );
}