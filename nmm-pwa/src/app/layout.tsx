import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import MatrixBackground from "@/components/MatrixBackground";
import { FRONTEND_VARIANT_COOKIE_KEY, FRONTEND_VARIANT_STORAGE_KEY } from "@/lib/frontend-variant";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const storageKey = "${FRONTEND_VARIANT_STORAGE_KEY}";
                const cookieKey = "${FRONTEND_VARIANT_COOKIE_KEY}";
                const fromStorage = window.localStorage.getItem(storageKey);
                const cookiePair = document.cookie
                  .split("; ")
                  .find((part) => part.startsWith(cookieKey + "="));
                const fromCookie = cookiePair ? cookiePair.split("=")[1] : null;
                const resolved = (fromStorage || fromCookie) === "matrix" ? "matrix" : "default";
                document.documentElement.dataset.frontendVariant = resolved;
              } catch {
                document.documentElement.dataset.frontendVariant = "default";
              }
            })();`,
          }}
        />
      </head>
      <body className="antialiased bg-[#031a22] selection:bg-[#58d9ea] selection:text-[#021118]">
        <MatrixBackground />
        {children}
      </body>
    </html>
  );
}
