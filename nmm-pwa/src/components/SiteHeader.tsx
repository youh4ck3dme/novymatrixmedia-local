"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { SiteNavigationItem } from "@/types/wordpress";

interface SiteHeaderProps {
  navigationItems: SiteNavigationItem[];
}

function NavigationLink({
  item,
  className,
  onClick,
}: {
  item: SiteNavigationItem;
  className: string;
  onClick?: () => void;
}) {
  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target={item.target || "_blank"}
        rel="noreferrer noopener"
        className={className}
        onClick={onClick}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

export default function SiteHeader({ navigationItems }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const currentDate = new Date()
    .toLocaleDateString("sk-SK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Bratislava",
    })
    .toUpperCase();

  return (
    <header className="relative z-40 overflow-visible rounded-xl border border-[rgba(111,231,255,0.08)] bg-[linear-gradient(180deg,rgba(6,46,56,0.85),rgba(5,26,34,0.82))] md:overflow-hidden md:shadow-[0_0_30px_rgba(80,226,255,0.03)] md:backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(111,231,255,0.07)] px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Zatvoriť menu" : "Otvoriť menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="relative z-[10000] flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[rgba(111,231,255,0.12)] bg-[rgba(6,42,52,0.72)] text-(--foreground) transition-all hover:border-[rgba(111,231,255,0.28)] hover:bg-[rgba(10,72,88,0.85)] md:hidden"
          >
            <span className="sr-only">{isMobileMenuOpen ? "Zatvoriť menu" : "Otvoriť menu"}</span>
            <span className="flex h-5 w-5 flex-col items-center justify-center gap-1.25">
              <span className={`block h-px w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block h-px w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>

          {isMobileMenuOpen ? (
            <>
              <button
                type="button"
                aria-label="Zatvoriť menu"
                onClick={closeMobileMenu}
                className="fixed inset-0 z-[9998] bg-[rgba(2,10,16,0.72)] backdrop-blur-[2px] md:hidden"
              />
              <nav
                id="mobile-navigation"
                aria-label="Mobilná navigácia"
                className="fixed inset-x-4 bottom-4 top-20 z-[9999] flex flex-col overflow-y-auto overscroll-contain rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(4,20,28,0.97)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] md:hidden"
              >
                <div className="pb-3 font-sans text-[10px] uppercase tracking-[0.35em] text-white/40">
                  Menu
                </div>
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item) => {
                    const baseClass = item.active
                      ? "flex items-center rounded-xl border border-[rgba(74,191,207,0.18)] bg-[rgba(74,191,207,0.12)] px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent)"
                      : "flex items-center rounded-xl border border-[rgba(111,231,255,0.05)] bg-[rgba(8,36,46,0.55)] px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.22em] text-white/80 transition-all hover:bg-[rgba(12,52,64,0.6)] hover:text-white";
                    return (
                      <NavigationLink
                        key={`row-${item.slug}-${item.href}`}
                        item={item}
                        className={baseClass}
                        onClick={closeMobileMenu}
                      />
                    );
                  })}
                </div>
                <div className="pt-4">
                  <a
                    href="https://t.me/novy_matrix_lm"
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={closeMobileMenu}
                    className="mb-6 flex w-full items-center justify-center rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(10,72,88,0.35)] px-5 py-3 font-sans text-[10px] uppercase tracking-[0.28em] text-white/60 transition-all hover:bg-[rgba(26,149,190,0.55)] hover:text-white"
                  >
                    Odoberať Telegram
                  </a>
                  <div className="font-serif text-[22px] font-semibold uppercase leading-tight tracking-[0.06em] text-white/12">
                    NOVY<br />MATRIX<br />MEDIA
                  </div>
                </div>
              </nav>
            </>
          ) : null}

          <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[rgba(111,231,255,0.12)] bg-[rgba(6,42,52,0.72)] text-(--foreground) md:shadow-[0_0_12px_rgba(74,191,207,0.06)] md:flex">
            <span className="font-sans text-lg">::</span>
          </div>

          <div className="min-w-0">
            <div className="font-sans text-[11px] uppercase tracking-[0.35em] text-(--accent)">
              Diskusia
            </div>
            <h1 className="font-serif text-xl font-semibold uppercase tracking-[0.12em] text-white sm:text-2xl md:text-3xl">
              NOVY MATRIX MEDIA
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm sm:px-7">
        <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-(--foreground)/82">
          <span className="rounded-full bg-[rgba(26,149,190,0.72)] px-4 py-1.5 text-white md:shadow-[0_0_12px_rgba(26,149,190,0.10)]">
            Vyberáme
          </span>
          <span className="text-(--foreground)/70">{currentDate}</span>
        </div>
        <nav className="hidden flex-wrap items-center gap-5 font-sans text-[11px] uppercase tracking-[0.26em] text-(--foreground)/70 md:flex">
          {navigationItems.map((item) => {
            const className = item.active ? "text-(--accent)" : "transition-colors hover:text-(--foreground)";
            return <NavigationLink key={`${item.slug}-${item.href}`} item={item} className={className} />;
          })}
        </nav>
      </div>
    </header>
  );
}
