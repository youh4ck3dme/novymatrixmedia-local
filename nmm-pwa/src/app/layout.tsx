import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import MatrixBackground from "@/components/MatrixBackground";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "NOVY MATRIX MEDIA | PWA",
  description: "Informačno-publicistický portál v novom rozmere.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#58d9ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="antialiased bg-[#031a22] selection:bg-[#58d9ea] selection:text-[#021118]">
        <MatrixBackground />
        {children}
      </body>
    </html>
  );
}
