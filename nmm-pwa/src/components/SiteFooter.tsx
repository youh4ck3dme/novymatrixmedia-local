import Image from "next/image";
import Link from "next/link";

import SocialLinksRow from "@/components/SocialLinksRow";
import { CONTACT_EMAIL } from "@/lib/contact-links";

const FOOTER_NAV_ITEMS = [
  { href: "/", label: "Domov" },
  { href: "/domov", label: "Z domova" },
  { href: "/zahranicie", label: "Zahraničie" },
  { href: "/komentare", label: "Komentáre" },
  { href: "/zaujimave", label: "Zaujímavé" },
  { href: "/video", label: "Video" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-[auto,1fr,auto] md:items-start md:justify-items-stretch">
          <Link
            href="/"
            aria-label="NOVY MATRIX MEDIA - domov"
            className="inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 transition-colors hover:border-cyan-500/70 md:justify-self-start"
          >
            <Image
              src="/brand/www.png"
              alt="NOVY MATRIX MEDIA logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-serif text-sm uppercase tracking-[0.14em] text-white">NOVY MATRIX MEDIA</span>
          </Link>

          <nav
            aria-label="Footer menu"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300 md:justify-start md:text-left"
          >
            {FOOTER_NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-cyan-400">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-slate-400">Sledujte redakciu</div>
            <SocialLinksRow
              emailLabel={CONTACT_EMAIL}
              className="flex flex-wrap items-center justify-center gap-2 md:justify-end"
              itemClassName="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white"
              iconClassName="h-3.5 w-3.5 text-cyan-400"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-center font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400 md:text-left">
          © {new Date().getFullYear()} NOVY MATRIX MEDIA
        </div>
      </div>
    </footer>
  );
}
