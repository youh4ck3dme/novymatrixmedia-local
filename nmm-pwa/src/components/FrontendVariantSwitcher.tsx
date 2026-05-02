"use client";

import { useEffect, useState } from "react";

import {
  applyBrowserFrontendVariant,
  FRONTEND_VARIANT_CHANGE_EVENT,
  type FrontendVariant,
  normalizeFrontendVariant,
  readBrowserFrontendVariant,
} from "@/lib/frontend-variant";

const SWITCH_OPTIONS: Array<{ value: FrontendVariant; label: string }> = [
  { value: "default", label: "Classic" },
  { value: "matrix", label: "Matrix" },
];

export default function FrontendVariantSwitcher() {
  const [variant, setVariant] = useState<FrontendVariant>("default");

  useEffect(() => {
    const syncFromBrowser = () => {
      const resolved = readBrowserFrontendVariant();
      setVariant(resolved);
      applyBrowserFrontendVariant(resolved);
    };

    const handleVariantChange = (event: Event) => {
      const customEvent = event as CustomEvent<FrontendVariant>;
      setVariant(normalizeFrontendVariant(customEvent.detail));
    };

    syncFromBrowser();
    window.addEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);

    return () => {
      window.removeEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);
    };
  }, []);

  return (
      <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 p-1 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-300">
      {SWITCH_OPTIONS.map((option) => {
        const active = option.value === variant;
        return (
          <button
            key={option.value}
            type="button"
            className={active
                  ? "rounded-full bg-slate-800 px-3 py-1.5 text-white"
              : "rounded-full px-3 py-1.5 text-slate-100/68 transition-colors hover:text-white"}
            onClick={() => applyBrowserFrontendVariant(option.value)}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
