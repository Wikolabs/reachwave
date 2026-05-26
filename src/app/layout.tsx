import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "ReachWave — Outreach multicanal ×30. Email + LinkedIn + SMS.",
  description: "900 séquences/semaine avec 1 commercial. Relances automatiques sur ouverture/clic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: "var(--font-body)", background: "#fff7ed" }}>{children}</body>
    </html>
  );
}
