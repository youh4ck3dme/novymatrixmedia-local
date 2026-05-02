import Image from "next/image";
import Link from "next/link";

import { getEditorialReadinessLabel } from "@/lib/editorial-workflow";
import { resolveSourceAttribution } from "@/lib/source-attribution";
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
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 md:backdrop-blur-md">
          <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-cyan-500/60" />

          <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-sm bg-cyan-400" />
              <h2 className="text-base font-bold uppercase tracking-widest text-cyan-400">
                Najnovšie
              </h2>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="mb-2 font-sans text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Nový Matrix Media
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Najnovšie publikované články prehľadne na jednom mieste.
            </p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-sm">
            {latestPosts.map((post) => {
              const sourceAttribution = resolveSourceAttribution(post);

              return (
                <Link
                  key={post.id}
                  href={post.href}
                  className="group flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 transition-colors hover:border-cyan-500/70"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-800">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title || "Ilustračný obrázok k článku"}
                      fill
                      quality={90}
                      sizes="56px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      {post.categoryLabel}
                      {getEditorialReadinessLabel(post.editorialReadiness) ? ` / ${getEditorialReadinessLabel(post.editorialReadiness)}` : ""}
                    </span>
                    <p className="text-sm leading-snug text-slate-200 transition-colors group-hover:text-white">
                      {post.title}
                    </p>
                    {sourceAttribution ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        Zdroj: {sourceAttribution.name}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
