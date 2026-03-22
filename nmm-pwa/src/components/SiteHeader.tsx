"use client";

import Link from "next/link";
import { useState } from "react";

import type { SiteNavigationItem } from "@/types/wordpress";

interface SiteHeaderProps {
  navigationItems: SiteNavigationItem[];
}

function NavigationLink({
  item,
  onClick,
}: {
  item: SiteNavigationItem;
  onClick?: () => void;
}) {
  const className = item.active ? "text-(--accent)" : "transition-colors hover:text-(--foreground)";

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

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-5 w-5 flex-col items-center justify-center gap-1.25">
      <span
        className={`block h-px w-full bg-current transition-all duration-200 origin-center ${open ? "translate-y-1.5 rotate-45" : ""}`}
      />
      <span
        className={`block h-px w-full bg-current transition-all duration-200 ${open ? "opacity-0" : ""}`}
      />
      <span
        className={`block h-px w-full bg-current transition-all duration-200 origin-center ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
      />
    </span>
  );
}

export default function SiteHeader({ navigationItems }: SiteHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentDate = new Date()
    .toLocaleDateString("sk-SK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <>
      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-[rgba(4,20,28,0.88)] shadow-[4px_0_24px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-300 md:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 pb-3 pt-6">
          <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-white/40">
            Menu
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
            aria-label="Zavrieť menu"
          >
            <span className="font-sans text-sm leading-none">✕</span>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col gap-2 overflow-y-auto px-5 py-2">
          {navigationItems.map((item) => {
            const isActive = item.active;
            const baseClass = `flex items-center rounded-xl px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.22em] transition-all ${isActive
              ? "bg-[rgba(74,191,207,0.12)] text-(--accent) border border-[rgba(74,191,207,0.18)]"
              : "bg-[rgba(8,36,46,0.55)] border border-[rgba(111,231,255,0.05)] text-white/80 hover:bg-[rgba(12,52,64,0.6)] hover:text-white"
              }`;
            if (item.isExternal) {
              return (
                <a
                  key={`row-${item.slug}-${item.href}`}
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noreferrer noopener"
                  className={baseClass}
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={`row-${item.slug}-${item.href}`}
                href={item.href}
                className={baseClass}
                onClick={() => setDrawerOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="mt-auto px-6 pb-8 pt-4">
          <a
            href="https://t.me/novy_matrix_lm"
            target="_blank"
            rel="noreferrer noopener"
            className="mb-8 flex w-full items-center justify-center rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(10,72,88,0.35)] px-5 py-3 font-sans text-[10px] uppercase tracking-[0.28em] text-white/60 transition-all hover:bg-[rgba(26,149,190,0.55)] hover:text-white"
            onClick={() => setDrawerOpen(false)}
          >
            Odoberať Telegram
          </a>
          <div className="font-serif text-[22px] font-semibold uppercase leading-tight tracking-[0.06em] text-white/12">
            NOVY<br />MATRIX<br />MEDIA
          </div>
        </div>
      </aside>

      <header className="overflow-hidden rounded-xl border border-[rgba(111,231,255,0.08)] bg-[linear-gradient(180deg,rgba(6,46,56,0.85),rgba(5,26,34,0.82))] shadow-[0_0_30px_rgba(80,226,255,0.03)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[rgba(111,231,255,0.07)] px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            {/* Hamburger button — mobile only, top-left */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(111,231,255,0.12)] bg-[rgba(6,42,52,0.72)] text-(--foreground) shadow-[0_0_12px_rgba(74,191,207,0.06)] transition-all hover:border-[rgba(111,231,255,0.28)] hover:bg-[rgba(10,72,88,0.85)] md:hidden"
              aria-label={drawerOpen ? "Zavrieť menu" : "Otvoriť menu"}
            >
              <HamburgerIcon open={drawerOpen} />
            </button>

            {/* Logo icon — desktop only */}
            <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[rgba(111,231,255,0.12)] bg-[rgba(6,42,52,0.72)] text-(--foreground) shadow-[0_0_12px_rgba(74,191,207,0.06)] md:flex">
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
            <span className="rounded-full bg-[rgba(26,149,190,0.72)] px-4 py-1.5 text-white shadow-[0_0_12px_rgba(26,149,190,0.10)]">
              Vyberáme
            </span>
            <span className="text-(--foreground)/70">{currentDate}</span>
          </div>
          <nav className="hidden flex-wrap items-center gap-5 font-sans text-[11px] uppercase tracking-[0.26em] text-(--foreground)/70 md:flex">
            {navigationItems.map((item) => (
              <NavigationLink key={`${item.slug}-${item.href}`} item={item} />
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}