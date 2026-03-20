import type { Metadata } from "next";
import "./globals.css";
import MatrixBackground from "@/components/MatrixBackground";

export const metadata: Metadata = {
  title: "Nový Matrix Media | PWA",
  description: "Informačno-publicistický portál v novom rozmere.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <meta name="theme-color" content="#00ff41" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased selection:bg-[#00ff41] selection:text-black">
        <MatrixBackground />
        {children}
      </body>
    </html>
  );
}
