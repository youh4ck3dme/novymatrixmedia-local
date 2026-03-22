import { getWordPressConfig } from "@/lib/wp-client";

interface WordPressRestOptions {
  revalidate?: number;
  tags?: string[];
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: WordPressRestOptions["query"]): string {
  const { restUrl } = getWordPressConfig();
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${restUrl}/${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function wpRestFetch<T>(path: string, options: WordPressRestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    next: {
      revalidate: options.revalidate ?? 300,
      tags: options.tags,
    },
  });

  if (!response.ok) {
    throw new Error(`WordPress REST request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}