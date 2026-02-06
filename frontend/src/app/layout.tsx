import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { BackgroundEffects } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "ClawDNA - Breed. Evolve. Dominate.",
  description: "The future of AI isn't built. It's grown. Evolve intelligent agents through genetic algorithms.",
  keywords: "AI, genetic algorithms, evolution, breeding, agents, machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <BackgroundEffects />
        <Navigation />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
