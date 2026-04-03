import Image from "next/image";
import Link from "next/link";

import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import { resolvePublicAuthor } from "@/lib/public-author";
import { resolveSourceAttribution } from "@/lib/source-attribution";
import type { SitePost } from "@/types/wordpress";

interface PostCardProps {
  post: SitePost;
}

export default function PostCard({ post }: PostCardProps) {
  const isTelegramIngest = post.ingestSource === "telegram";
  const editorialReadinessLabel = getEditorialReadinessLabel(post.editorialReadiness);
  const editorialReadinessTone = getEditorialReadinessTone(post.editorialReadiness);
  const sourceAttribution = resolveSourceAttribution(post);
  const publicAuthor = resolvePublicAuthor(post);
  const editorialReadinessClassName = editorialReadinessTone === "warning"
    ? "rounded-full border border-[rgba(251,146,60,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-orange-100/82"
    : editorialReadinessTone === "progress"
      ? "rounded-full border border-[rgba(59,130,246,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-sky-100/82"
      : "rounded-full border border-[rgba(16,185,129,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-emerald-100/82";

  return (
    <article className="group rounded-xl border border-[rgba(111,231,255,0.07)] bg-[rgba(5,32,40,0.58)] p-4 md:backdrop-blur-sm">
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-[rgba(111,231,255,0.05)]">
        <Image
          src={post.imageUrl}
          alt={post.imageAlt}
          fill
          quality={92}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-all duration-500 group-hover:scale-[1.01]"
        />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent)">
        <span>{post.categoryLabel}</span>
        {post.highlightBadge ? <span className="rounded-full border border-[rgba(111,231,255,0.12)] px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">{post.highlightBadge}</span> : null}
        {post.articleType ? <span className="text-slate-100/70">{post.articleType}</span> : null}
        {isTelegramIngest ? <span className="rounded-full border border-[rgba(111,231,255,0.12)] px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">Telegram ingest</span> : null}
        {editorialReadinessLabel ? <span className={editorialReadinessClassName}>{editorialReadinessLabel}</span> : null}
      </div>
      <Link href={post.href} className="mb-2 block font-serif text-2xl leading-tight text-white transition-colors group-hover:text-(--accent)">
        {post.title}
      </Link>
      {post.subtitle ? <p className="mb-2 text-sm leading-relaxed text-slate-200/72">{post.subtitle}</p> : null}
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-slate-300/68">
        {post.publishedAt}{publicAuthor ? ` · ${publicAuthor.name}` : ""}{post.estimatedReadingTime ? ` · ${post.estimatedReadingTime}` : ""}
      </p>
      {sourceAttribution ? (
        <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300/72">
          Zdroj: {sourceAttribution.url ? (
            <a href={sourceAttribution.url} target="_blank" rel="noreferrer noopener" className="text-(--accent) transition-colors hover:text-white">
              {sourceAttribution.name}
            </a>
          ) : sourceAttribution.name}
        </p>
      ) : null}
    </article>
  );
}
