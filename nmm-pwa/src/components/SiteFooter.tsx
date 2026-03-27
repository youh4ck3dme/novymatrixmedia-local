import Image from "next/image";
import Link from "next/link";

import { CONTACT_EMAIL, EXTERNAL_LINK_REL, TELEGRAM_CHANNEL_URL, TIKTOK_PROFILE_URL, getContactEmailHref } from "@/lib/contact-links";

const FOOTER_NAV_ITEMS = [
  { href: "/", label: "Domov" },
  { href: "/domov", label: "Z domova" },
  { href: "/zahranicie", label: "Zahraničie" },
  { href: "/komentare", label: "Komentáre" },
  { href: "/zaujimave", label: "Zaujímavé" },
  { href: "/video", label: "Video" },
] as const;

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M4 8.5L12 13.5L20 8.5" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M20.58 4.37c.84-.33 1.63.32 1.41 1.18l-3.18 12.44c-.21.82-1.13 1.17-1.83.7l-4.04-2.73-2.06 2.02c-.51.49-1.38.24-1.54-.45l-1.21-5.03-4.03-1.47c-.93-.34-.97-1.64-.07-2.04L20.58 4.37zm-3.4 2.46L8.46 12.3a.75.75 0 00-.34.77l.73 3.03 1.08-1.06c.25-.24.64-.29.94-.1l3.96 2.68 2.35-9.79z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M16.76 3.2c.39 1.62 1.53 2.74 3.04 2.98v2.69a5.84 5.84 0 01-3-.86v6.03c0 3.2-2.32 5.6-5.48 5.6A5.53 5.53 0 015.8 14.1c0-3.12 2.34-5.53 5.4-5.53.39 0 .74.03 1.09.12v2.85a2.77 2.77 0 00-.98-.18 2.7 2.7 0 00-2.74 2.74c0 1.58 1.16 2.8 2.74 2.8 1.5 0 2.74-1.16 2.74-3.1V2.99h2.71z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(111,231,255,0.1)] bg-[linear-gradient(180deg,rgba(5,26,34,0.9),rgba(3,18,24,0.96))]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 justify-items-center md:grid-cols-[auto,1fr,auto] md:items-start md:justify-items-stretch">
          <Link
            href="/"
            aria-label="NOVY MATRIX MEDIA - domov"
            className="inline-flex items-center gap-3 rounded-xl border border-[rgba(111,231,255,0.14)] bg-[rgba(7,45,55,0.48)] px-3 py-2 transition-colors hover:border-[rgba(111,231,255,0.28)] md:justify-self-start"
          >
            <Image
              src="/brand/www.png"
              alt="NOVY MATRIX MEDIA logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-serif text-sm uppercase tracking-[0.14em] text-white">NOVY MATRIX MEDIA</span>
          </Link>

          <nav aria-label="Footer menu" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/80 md:justify-start md:text-left">
            {FOOTER_NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-(--accent)">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="Telegram kanál NOVY MATRIX MEDIA"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(10,72,88,0.34)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
            >
              <TelegramIcon className="h-3.5 w-3.5 text-(--accent)" />
              <span>Telegram</span>
            </a>
            <a
              href={TIKTOK_PROFILE_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="TikTok profil NOVY MATRIX MEDIA"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,49,62,0.3)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
            >
              <TikTokIcon className="h-3.5 w-3.5 text-(--accent)" />
              <span>TikTok</span>
            </a>
            <a
              href={getContactEmailHref()}
              aria-label="Napísať email redakcii NOVY MATRIX MEDIA"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(8,52,64,0.3)] px-3 py-2 font-sans text-[10px] tracking-[0.06em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
            >
              <EmailIcon className="h-3.5 w-3.5 text-(--accent)" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-[rgba(111,231,255,0.08)] pt-4 text-center font-sans text-[10px] uppercase tracking-[0.16em] text-slate-300/56 md:text-left">
          © {new Date().getFullYear()} NOVY MATRIX MEDIA
        </div>
      </div>
    </footer>
  );
}

