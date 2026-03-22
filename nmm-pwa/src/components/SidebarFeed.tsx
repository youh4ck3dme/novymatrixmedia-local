import Link from "next/link";

import type { SitePost } from "@/types/wordpress";

interface SidebarFeedProps {
  posts: SitePost[];
}

export default function SidebarFeed({ posts }: SidebarFeedProps) {
  const featured = posts[1] ?? posts[0];
  const remaining = posts.filter((post) => post.id !== featured?.id);

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-6">
        <div className="relative overflow-hidden rounded-4xl border border-[rgba(111,231,255,0.2)] bg-[rgba(6,36,44,0.74)] p-6 shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md">
          <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-(--accent)" />

          <div className="mb-6 flex items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.16)] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-sm bg-(--accent)" />
              <h3 className="font-mono text-lg uppercase tracking-[0.28em] text-(--accent)">
                Odoberať
              </h3>
            </div>
            <Link href="https://t.me/novy_matrix_lm" className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--foreground)/70 transition-colors hover:text-white">
              Telegram
            </Link>
          </div>

          <div className="mb-6 rounded-3xl border border-[rgba(111,231,255,0.14)] bg-[rgba(8,49,60,0.62)] p-5">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-(--accent)">
              Novy Matrix Media
            </div>
            <p className="text-sm leading-relaxed text-slate-100/84">
              Priamy odber hlavných správ, komentárov a diskusných tém v jednom kanáli.
            </p>
          </div>

          <div className="flex flex-col gap-6 font-mono text-sm">
            {remaining.map((post) => (
              <div key={post.id} className="group relative border-l border-[rgba(111,231,255,0.18)] pl-4 transition-colors hover:border-(--accent)">
                <span className="mb-1 block text-xs text-(--accent)/90">{post.categoryLabel.toUpperCase()}</span>
                <Link href={post.href} className="leading-relaxed text-slate-100/80 group-hover:text-white">
                  {post.title}
                </Link>
              </div>
            ))}

            {featured ? (
              <div className="group relative border-l border-(--accent) pl-4">
                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border border-[rgba(224,252,255,0.7)] bg-(--accent) shadow-[0_0_14px_rgba(88,217,234,0.55)]" />
                <span className="mb-1 block text-xs font-bold text-(--accent)">FEATURED :: KOMENTÁR</span>
                <Link href={featured.href} className="font-semibold leading-relaxed text-white">
                  {featured.title}
                </Link>
              </div>
            ) : null}
          </div>

          <Link
            href="https://t.me/novy_matrix_lm"
            className="mt-8 block w-full rounded-full border border-[rgba(111,231,255,0.22)] bg-[rgba(31,169,214,0.72)] py-3 text-center font-mono text-sm uppercase tracking-[0.24em] text-white transition-all hover:bg-[rgba(31,169,214,0.9)]"
          >
            Odoberať teraz
          </Link>
        </div>
      </div>
    </aside>
  );
}