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
  const summaryCandidate = (post.subtitle?.trim() || post.excerpt?.trim() || "");
  const normalizedTitle = post.title.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedSummary = summaryCandidate.replace(/\s+/g, " ").trim().toLowerCase();
  const cardSummary = normalizedSummary && normalizedSummary !== normalizedTitle
    ? summaryCandidate
    : "";
  const editorialReadinessClassName = editorialReadinessTone === "warning"
    ? "rounded-full border border-blue-600/35 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-200"
    : editorialReadinessTone === "progress"
      ? "rounded-full border border-cyan-500/35 px-2 py-1 text-[10px] font-bold tracking-widest text-cyan-300"
      : "rounded-full border border-slate-700 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-200";

  return (
    <article className="group rounded-xl border border-slate-800 bg-slate-900 p-4 transition-transform duration-200 hover:-translate-y-1 md:backdrop-blur-sm">
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-slate-800">
        <Image
          src={post.imageUrl}
          alt={post.imageAlt || post.title || "Ilustračný obrázok k článku"}
          fill
          quality={92}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-widest text-cyan-400">
        <span>{post.categoryLabel}</span>
        {post.highlightBadge ? <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-200">{post.highlightBadge}</span> : null}
        {post.articleType ? <span className="text-slate-300">{post.articleType}</span> : null}
        {isTelegramIngest ? <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-200">Telegram ingest</span> : null}
        {editorialReadinessLabel ? <span className={editorialReadinessClassName}>{editorialReadinessLabel}</span> : null}
      </div>
      <Link
        href={post.href}
        className="mb-2 block overflow-hidden text-2xl font-bold leading-snug text-slate-200 transition-colors group-hover:text-cyan-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
      >
        {post.title}
      </Link>
      {cardSummary ? (
        <p className="mb-2 overflow-hidden text-sm leading-relaxed text-slate-400 sm:text-base [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {cardSummary}
        </p>
      ) : null}
      <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        {post.publishedAt}{publicAuthor ? ` · ${publicAuthor.name}` : ""}{post.estimatedReadingTime ? ` · ${post.estimatedReadingTime}` : ""}
      </p>
      {sourceAttribution ? (
        <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300">
          Zdroj: {sourceAttribution.url ? (
            <a href={sourceAttribution.url} target="_blank" rel="noreferrer noopener" className="text-cyan-400 transition-colors hover:text-white">
              {sourceAttribution.name}
            </a>
          ) : sourceAttribution.name}
        </p>
      ) : null}
    </article>
  );
}
