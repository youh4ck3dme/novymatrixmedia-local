import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import { buildDefaultMetadata } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const defaultMetadata = buildDefaultMetadata();

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "NOVY MATRIX MEDIA | PWA",
  description: "Informačno-publicistický portál v novom rozmere.",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "NOVY MATRIX MEDIA | PWA",
    description: "Informačno-publicistický portál v novom rozmere.",
  },
  twitter: {
    ...defaultMetadata.twitter,
    title: "NOVY MATRIX MEDIA | PWA",
    description: "Informačno-publicistický portál v novom rozmere.",
  },
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
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500 selection:text-slate-950`}>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
