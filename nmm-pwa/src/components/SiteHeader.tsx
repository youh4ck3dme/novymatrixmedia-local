import Link from "next/link";

import type { SiteNavigationItem } from "@/types/wordpress";

interface SiteHeaderProps {
  navigationItems: SiteNavigationItem[];
}

function NavigationLink({ item }: { item: SiteNavigationItem }) {
  const className = item.active ? "text-(--accent)" : "transition-colors hover:text-(--foreground)";

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target={item.target || "_blank"}
        rel="noreferrer noopener"
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export default function SiteHeader({ navigationItems }: SiteHeaderProps) {
  const currentDate = new Date().toLocaleDateString("sk-SK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  return (
    <header className="overflow-hidden rounded-4xl border border-[rgba(111,231,255,0.2)] bg-[linear-gradient(180deg,rgba(7,55,67,0.88),rgba(7,32,40,0.86))] shadow-[0_0_40px_rgba(80,226,255,0.14)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(111,231,255,0.16)] px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(111,231,255,0.24)] bg-[rgba(8,49,60,0.8)] text-(--foreground) shadow-[0_0_20px_rgba(88,217,234,0.16)]">
            <span className="font-mono text-lg">::</span>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-(--accent)">
              Diskusia
            </div>
            <h1 className="truncate font-serif text-2xl font-semibold tracking-[0.12em] text-white sm:text-3xl">
              Novy Matrix Media
            </h1>
          </div>
        </div>

        <a
          href="https://t.me/novy_matrix_lm"
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 rounded-full border border-[rgba(111,231,255,0.3)] bg-[rgba(13,84,102,0.58)] px-5 py-2 font-mono text-xs uppercase tracking-[0.28em] text-(--foreground) transition-all hover:bg-[rgba(31,169,214,0.78)] hover:text-white"
        >
          Odoberať
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm sm:px-7">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-(--foreground)/82">
          <span className="rounded-full bg-[rgba(31,169,214,0.88)] px-4 py-2 text-white shadow-[0_0_20px_rgba(31,169,214,0.3)]">
            Vyberáme
          </span>
          <span className="text-(--foreground)/70">{currentDate}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-[0.26em] text-(--foreground)/70">
          {navigationItems.map((item) => (
            <NavigationLink key={`${item.slug}-${item.href}`} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}