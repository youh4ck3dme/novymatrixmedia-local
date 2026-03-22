import Link from "next/link";

import type { SitePost } from "@/types/wordpress";

interface PostCardProps {
  post: SitePost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-[1.75rem] border border-[rgba(111,231,255,0.16)] bg-[rgba(7,39,48,0.68)] p-4 backdrop-blur-sm">
      <img
        src={post.imageUrl}
        alt={post.imageAlt}
        className="mb-4 h-48 w-full rounded-[1.25rem] border border-[rgba(111,231,255,0.12)] object-cover transition-all duration-500 group-hover:scale-[1.01]"
      />
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-(--accent)">{post.categoryLabel}</div>
      <Link href={post.href} className="mb-2 block font-serif text-2xl leading-tight text-white transition-colors group-hover:text-(--accent)">
        {post.title}
      </Link>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300/60">{post.publishedAt}</p>
    </article>
  );
}