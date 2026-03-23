import Image from "next/image";
import Link from "next/link";

import { getEditorialReadinessLabel } from "@/lib/editorial-workflow";
import type { SitePost } from "@/types/wordpress";

interface SidebarFeedProps {
  posts: SitePost[];
}

export default function SidebarFeed({ posts }: SidebarFeedProps) {
  const getSortTimestamp = (value?: string): number => {
    if (!value) {
      return 0;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const latestPosts = [...posts]
    .sort((a, b) => getSortTimestamp(b.modifiedAt) - getSortTimestamp(a.modifiedAt))
    .slice(0, 6);

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-6">
        <div className="relative overflow-hidden rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(5,30,38,0.62)] p-6 md:shadow-[0_0_24px_rgba(80,226,255,0.02)] md:backdrop-blur-md">
          <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-(--accent)" />

          <div className="mb-6 flex items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.07)] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-sm bg-(--accent)" />
              <h2 className="font-serif text-lg uppercase tracking-[0.28em] text-(--accent)">
                Najnovšie
              </h2>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-[rgba(111,231,255,0.06)] bg-[rgba(6,42,52,0.52)] p-5">
            <div className="mb-2 font-sans text-[11px] uppercase tracking-[0.3em] text-(--accent)">
              Nový Matrix Media
            </div>
            <p className="text-sm leading-relaxed text-slate-100/88">
              Najnovšie publikované články prehľadne na jednom mieste.
            </p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-sm">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={post.href}
                className="group flex items-start gap-3 rounded-lg border border-[rgba(111,231,255,0.06)] bg-[rgba(6,34,42,0.36)] p-3 transition-colors hover:border-(--accent)"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[rgba(111,231,255,0.10)]">
                  <Image
                    src={post.imageUrl}
                    alt={post.imageAlt}
                    fill
                    sizes="56px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-(--accent)/90">
                    {post.categoryLabel}
                    {getEditorialReadinessLabel(post.editorialReadiness) ? ` / ${getEditorialReadinessLabel(post.editorialReadiness)}` : ""}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-100/86 transition-colors group-hover:text-white">
                    {post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
