import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "optional",
  preload: false,
});

const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  variable: "--font-merriweather",
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  title: "NOVY MATRIX MEDIA | PWA",
  description: "Informačno-publicistický portál v novom rozmere.",
  manifest: "/manifest.json",
  verification: {
    google: "-wCURK9Y7qxlvcyGjWtw39xEehSvVAwPxnQtCaN2Wt8",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#58d9ea",
};

export default function RootLayout() {
  return (
    <html lang="sk" className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        <link rel="preconnect" href="https://info.novymatrixmedia.sk" crossOrigin="" />
        <link rel="dns-prefetch" href="//info.novymatrixmedia.sk" />
      </head>
      <body className="overflow-hidden bg-[#05050d] antialiased">
        <main className="flex min-h-svh min-h-dvh items-center justify-center overflow-hidden bg-[#05050d]">
          <Image
            src="/vercelblok.png"
            alt="Deployment suspended"
            width={1024}
            height={1536}
            className="h-svh h-dvh w-auto max-w-none shrink-0 select-none"
            priority
            draggable={false}
          />
        </main>
      </body>
    </html>
  );
}
