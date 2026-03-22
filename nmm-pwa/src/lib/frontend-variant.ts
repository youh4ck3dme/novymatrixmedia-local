export type FrontendVariant = "default" | "matrix";

export const FRONTEND_VARIANT_STORAGE_KEY = "nmm_frontend_variant";
export const FRONTEND_VARIANT_COOKIE_KEY = "nmm_frontend_variant";
export const FRONTEND_VARIANT_CHANGE_EVENT = "nmm:frontend-variant-change";

export function normalizeFrontendVariant(value?: string | null): FrontendVariant {
  return value?.toLowerCase() === "matrix" ? "matrix" : "default";
}

export function readVariantFromCookieString(cookieString: string): FrontendVariant {
  const escapedKey = FRONTEND_VARIANT_COOKIE_KEY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${escapedKey}=([^;]+)`));
  return normalizeFrontendVariant(match?.[1] ?? null);
}

export function readBrowserFrontendVariant(): FrontendVariant {
  if (typeof window === "undefined") {
    return "default";
  }

  const fromStorage = window.localStorage.getItem(FRONTEND_VARIANT_STORAGE_KEY);
  if (fromStorage) {
    return normalizeFrontendVariant(fromStorage);
  }

  return readVariantFromCookieString(window.document.cookie);
}

export function applyBrowserFrontendVariant(variant: FrontendVariant): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeFrontendVariant(variant);

  window.localStorage.setItem(FRONTEND_VARIANT_STORAGE_KEY, normalized);
  window.document.cookie = `${FRONTEND_VARIANT_COOKIE_KEY}=${normalized}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.document.documentElement.dataset.frontendVariant = normalized;
  window.dispatchEvent(new CustomEvent<FrontendVariant>(FRONTEND_VARIANT_CHANGE_EVENT, { detail: normalized }));
}
