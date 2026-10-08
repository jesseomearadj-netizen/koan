import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";

// Rounded, friendly body type with a calligraphic serif for headings: shibumi, but smiling.
const sans = Zen_Maru_Gothic({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans", display: "swap" });
const display = Zen_Old_Mincho({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "https://koan.vercel.app"),
  title: { default: "Koan — a light guide back to your own experience", template: "%s · Koan" },
  description: "A mindful friend with an old teacher's eyes. Notice your stories, experiment with stillness and nature, and look for yourself.",
  applicationName: "Koan",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Koan", statusBarStyle: "default" },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }, { url: "/icons/icon.svg", type: "image/svg+xml" }], apple: "/icons/apple-touch-icon.png" },
  openGraph: {
    title: "Koan — a light guide back to your own experience",
    description: "Not another voice in your head. A friend who keeps asking: is that true? Who is noticing?",
    type: "website",
    siteName: "Koan",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#151412" }, { color: "#f6f2e9" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
