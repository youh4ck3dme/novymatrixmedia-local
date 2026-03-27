"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { SiteNavigationItem } from "@/types/wordpress";
import SmartSearchOverlay from "@/components/SmartSearchOverlay";

interface SiteHeaderProps {
  navigationItems: SiteNavigationItem[];
}

const TELEGRAM_URL = "https://t.me/novy_matrix_lm";
const CONTACT_EMAIL = "novymatrixmedia@gmail.com";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hasOverlayOpen = isMobileMenuOpen || isSearchOpen;

  useEffect(() => {
    if (!hasOverlayOpen) {
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
  }, [hasOverlayOpen]);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasOverlayOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeSearch = () => setIsSearchOpen(false);

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
          <Link
            href="/"
            aria-label="NOVY MATRIX MEDIA - domov"
            className="relative z-[10001] flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[rgba(111,231,255,0.14)] bg-[rgba(6,42,52,0.72)] p-1.5 shadow-[0_0_14px_rgba(74,191,207,0.08)] transition-colors hover:border-[rgba(111,231,255,0.3)] hover:bg-[rgba(10,72,88,0.9)]"
          >
            <Image
              src="/brand/www.png"
              alt="NOVY MATRIX MEDIA logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </Link>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Zatvoriť menu" : "Otvoriť menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => {
              setIsSearchOpen(false);
              setIsMobileMenuOpen((prev) => !prev);
            }}
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
                  <div className="mb-4 grid grid-cols-1 gap-2">
                    <a
                      href={TELEGRAM_URL}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={closeMobileMenu}
                      aria-label="Telegram kanál NOVY MATRIX MEDIA"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(10,72,88,0.35)] px-5 py-3 font-sans text-[10px] uppercase tracking-[0.24em] text-white/78 transition-all hover:bg-[rgba(26,149,190,0.55)] hover:text-white"
                    >
                      <TelegramIcon className="h-4 w-4" />
                      <span>Telegram</span>
                    </a>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      onClick={closeMobileMenu}
                      aria-label="Napísať email redakcii"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(8,52,64,0.32)] px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-white/72 transition-all hover:bg-[rgba(16,88,106,0.55)] hover:text-white"
                    >
                      <EmailIcon className="h-4 w-4" />
                      <span>Email redakcii</span>
                    </a>
                  </div>

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

        <button
          type="button"
          aria-label="Otvoriť inteligentné vyhľadávanie"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsSearchOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(111,231,255,0.12)] bg-[rgba(6,42,52,0.72)] text-(--foreground) transition-colors hover:border-[rgba(111,231,255,0.28)] hover:bg-[rgba(10,72,88,0.85)]"
        >
          <span className="sr-only">Vyhľadávanie</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.65 16.65" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm sm:px-7">
        <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-(--foreground)/82">
          <span className="rounded-full bg-[rgba(26,149,190,0.72)] px-4 py-1.5 text-white md:shadow-[0_0_12px_rgba(26,149,190,0.10)]">
            Vyberáme
          </span>
          <span className="text-(--foreground)/70">{currentDate}</span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Otvoriť Telegram kanál NOVY MATRIX MEDIA"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(10,72,88,0.34)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-100/84 transition-colors hover:border-(--accent) hover:text-white"
          >
            <TelegramIcon className="h-3.5 w-3.5 text-(--accent)" />
            <span>Telegram</span>
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label="Napísať email redakcii NOVY MATRIX MEDIA"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(8,52,64,0.28)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-slate-100/84 transition-colors hover:border-(--accent) hover:text-white"
          >
            <EmailIcon className="h-3.5 w-3.5 text-(--accent)" />
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>
        <nav className="hidden flex-wrap items-center gap-5 font-sans text-[11px] uppercase tracking-[0.26em] text-(--foreground)/70 md:flex">
          {navigationItems.map((item) => {
            const className = item.active ? "text-(--accent)" : "transition-colors hover:text-(--foreground)";
            return <NavigationLink key={`${item.slug}-${item.href}`} item={item} className={className} />;
          })}
        </nav>
      </div>

      <SmartSearchOverlay open={isSearchOpen} onClose={closeSearch} />
    </header>
  );
}

