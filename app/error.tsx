"use client";
import { Frog } from "@/components/Ink";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="lost">
      <Frog size={110} />
      <h1>Oops, a ripple</h1>
      <p>Something went wrong on our side. Your journal is safe. Take a breath and try again.</p>
      <button className="btn-ink" onClick={reset}>Try again</button>
    </main>
  );
}
