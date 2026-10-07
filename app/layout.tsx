import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap", axes: ["opsz", "SOFT"] });

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
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Koan" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#161a17" }, { color: "#f4f1ea" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
