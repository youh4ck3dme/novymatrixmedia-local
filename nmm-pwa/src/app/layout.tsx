import type { Metadata, Viewport } from "next";
import "./globals.css";
import MatrixBackground from "@/components/MatrixBackground";

export const metadata: Metadata = {
  title: "Nový Matrix Media | PWA",
  description: "Informačno-publicistický portál v novom rozmere.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00ff41",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#050505] selection:bg-[#00ff41] selection:text-black">
        <MatrixBackground />
        {children}
      </body>
    </html>
  );
}
