import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/AuthScreen";
import { currentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (await currentUser()) redirect("/");
  const { mode } = await searchParams;
  return <AuthScreen initialMode={mode === "signup" ? "signup" : "signin"} />;
}
