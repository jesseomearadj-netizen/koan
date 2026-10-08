import Link from "next/link";
import { Frog } from "@/components/Ink";

export default function NotFound() {
  return (
    <main className="lost">
      <Frog size={110} />
      <h1>Nothing here</h1>
      <p>Which, to be fair, is a very zen thing to find. This page doesn&apos;t exist, though.</p>
      <Link href="/" className="btn-ink">Back to the start</Link>
    </main>
  );
}
