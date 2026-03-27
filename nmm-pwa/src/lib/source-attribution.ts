import type { SitePost } from "@/types/wordpress";

const INTERNAL_SOURCE_NAMES = new Set([
  "novy matrix media",
  "nový matrix media",
  "nmm",
]);

export interface SourceAttribution {
  name: string;
  url?: string;
}

function normalizeSourceName(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function resolveSourceAttribution(post: Pick<SitePost, "sourceName" | "sourceUrl">): SourceAttribution | null {
  const sourceName = post.sourceName?.trim() || "";

  if (!sourceName) {
    return null;
  }

  if (INTERNAL_SOURCE_NAMES.has(normalizeSourceName(sourceName))) {
    return null;
  }

  const sourceUrl = post.sourceUrl?.trim();

  return {
    name: sourceName,
    url: sourceUrl || undefined,
  };
}
