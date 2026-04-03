import { resolveSourceAttribution } from "@/lib/source-attribution";
import type { SitePost } from "@/types/wordpress";

export interface PublicAuthorDisplay {
  name: string;
  type?: string;
}

export function resolvePublicAuthor(post: Pick<SitePost, "publicAuthor" | "authorName" | "sourceName" | "sourceUrl">): PublicAuthorDisplay | null {
  const explicitPublicAuthor = post.publicAuthor?.name?.trim();
  if (explicitPublicAuthor) {
    return {
      name: explicitPublicAuthor,
      type: post.publicAuthor?.type,
    };
  }

  const legacyAuthor = post.authorName?.trim();
  if (legacyAuthor) {
    return {
      name: legacyAuthor,
    };
  }

  if (resolveSourceAttribution(post)) {
    return null;
  }

  return {
    name: "Nový Matrix Media",
  };
}