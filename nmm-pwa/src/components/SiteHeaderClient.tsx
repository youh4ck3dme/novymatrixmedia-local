"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import SmartSearchOverlay from "@/components/SmartSearchOverlay";
import SocialLinksRow from "@/components/SocialLinksRow";
import { EXTERNAL_LINK_REL } from "@/lib/contact-links";
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
        rel={EXTERNAL_LINK_REL}
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

export default function SiteHeaderClient({ navigationItems }: SiteHeaderProps) {
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
    <header className="relative z-40 overflow-visible rounded-xl border border-slate-800/90 bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] shadow-2xl shadow-slate-950/60 md:overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            aria-label="NOVY MATRIX MEDIA - domov"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1.5 transition-colors hover:border-cyan-500/70"
          >
            <Image
              src="/brand/www.png"
              alt="NOVY MATRIX MEDIA logo"
              width={36}
              height={36}
              className="object-contain"
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
            className="relative z-[10030] flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-100 transition-all hover:border-cyan-500/70 md:hidden"
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
                className="fixed inset-0 z-[10010] bg-slate-950/90 backdrop-blur-[2px] md:hidden"
              />
              <nav
                id="mobile-navigation"
                aria-label="Mobilná navigácia"
                className="fixed inset-x-4 bottom-4 top-20 z-[10020] flex flex-col overflow-y-auto overscroll-contain rounded-xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/70 md:hidden"
              >
                <div className="pb-3 font-sans text-[10px] uppercase tracking-[0.35em] text-slate-400">
                  Menu
                </div>
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item) => {
                    const baseClass = item.active
                      ? "flex items-center rounded-xl border border-cyan-500/35 bg-slate-900 px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400"
                      : "flex items-center rounded-xl border border-slate-800 bg-slate-900/90 px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.22em] text-slate-200 transition-colors hover:border-blue-600/60 hover:text-white";

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

                <SocialLinksRow
                  onItemClick={closeMobileMenu}
                  className="mb-4 mt-4 grid grid-cols-2 gap-2"
                  itemClassName="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 font-sans text-[10px] uppercase tracking-[0.24em] text-slate-100 transition-colors hover:border-cyan-500/70 hover:text-white"
                  iconClassName="h-4 w-4 text-cyan-400"
                />

                <div className="font-serif text-[22px] font-semibold uppercase leading-tight tracking-[0.06em] text-slate-800">
                  NOVY<br />MATRIX<br />MEDIA
                </div>
              </nav>
            </>
          ) : null}

          <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-100 md:flex">
            <span className="font-sans text-lg">::</span>
          </div>

          <div className="min-w-0">
            <div className="font-sans text-[11px] uppercase tracking-[0.35em] text-cyan-400">
              Diskusia
            </div>
            <div className="font-serif text-xl font-semibold uppercase tracking-[0.12em] text-white sm:text-2xl md:text-3xl">
              NOVY MATRIX MEDIA
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Otvoriť inteligentné vyhľadávanie"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsSearchOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-100 transition-colors hover:border-cyan-500/70"
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
        <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-slate-300">
          <span className="rounded-full border border-cyan-500/30 bg-slate-900 px-4 py-1.5 text-cyan-400">
            Vyberáme
          </span>
          <span className="text-slate-400" suppressHydrationWarning>{currentDate}</span>
        </div>

        <SocialLinksRow
          className="flex w-full flex-wrap items-center gap-2 md:w-auto"
          itemClassName="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white"
          iconClassName="h-3.5 w-3.5 text-cyan-400"
        />

        <nav className="hidden flex-wrap items-center gap-5 font-sans text-[11px] uppercase tracking-[0.26em] text-slate-300 md:flex">
          {navigationItems.map((item) => {
            const className = item.active ? "text-cyan-400" : "transition-colors hover:text-white";
            return <NavigationLink key={`${item.slug}-${item.href}`} item={item} className={className} />;
          })}
        </nav>
      </div>

      <SmartSearchOverlay open={isSearchOpen} onClose={closeSearch} />
    </header>
  );
}
