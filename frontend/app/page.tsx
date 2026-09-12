"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "ok") {
          setStatus("connected");
        } else {
          throw new Error("Unexpected response");
        }
      })
      .catch((err: Error) => {
        setStatus("error");
        setError(err.message);
      });
  }, [apiUrl]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8">
      <h1 className="text-2xl font-semibold">NimGames</h1>
      {/* Temporary backend connection test — replace with the real home screen later. */}
      <p className="text-sm text-zinc-500">
        Temporary backend connection test — will be replaced by the real home
        screen.
      </p>
      {!apiUrl && (
        <p className="font-medium text-red-600">
          Backend: Not reachable (NEXT_PUBLIC_API_URL is not set)
        </p>
      )}
      {apiUrl && status === "checking" && <p>Backend: Checking...</p>}
      {apiUrl && status === "connected" && (
        <p className="font-medium text-green-600">Backend: Connected</p>
      )}
      {apiUrl && status === "error" && (
        <p className="font-medium text-red-600">
          Backend: Not reachable{error ? ` (${error})` : ""}
        </p>
      )}
    </main>
  );
}