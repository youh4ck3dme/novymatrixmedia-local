import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import ArticleComments from "@/components/ArticleComments";
import SiteHeader from "@/components/SiteHeader";
import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import { CONTACT_EMAIL, EXTERNAL_LINK_REL, TELEGRAM_CHANNEL_URL, TIKTOK_PROFILE_URL, YOUTUBE_CHANNEL_URL, getContactEmailHref } from "@/lib/contact-links";
import { resolveSourceAttribution } from "@/lib/source-attribution";
import { getCategoryPageData, getNavigationItems, getPostBySlug, getPostsByIds } from "@/lib/wp-queries";
import { buildCategoryMetadata, buildPostMetadata } from "@/lib/seo";

interface SlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface GalleryItem {
  url: string;
  caption?: string;
  alt: string;
}

export const revalidate = 300;

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://novymatrixmedia.sk").replace(/\/$/, "");

function renderHtml(content?: string) {
  return { __html: linkifyPlainUrlsInHtml(content ?? "") };
}

function truncateLinkLabel(value: string, limit = 30): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
}

function linkifyPlainUrlsInHtml(html: string): string {
  if (!html || !html.includes("http")) {
    return html;
  }

  const chunks = html.split(/(<[^>]+>)/g);
  const urlRegex = /https?:\/\/[^\s<>"']+/gi;
  let inAnchor = false;

  return chunks
    .map((chunk) => {
      if (!chunk || chunk.startsWith("<")) {
        if (/^<a\b/i.test(chunk)) {
          inAnchor = true;
        } else if (/^<\/a>/i.test(chunk)) {
          inAnchor = false;
        }
        return chunk;
      }

      if (inAnchor) {
        return chunk;
      }

      return chunk.replace(urlRegex, (rawUrl) => {
        const trailingMatch = rawUrl.match(/[).,!?;:]+$/);
        const trailing = trailingMatch ? trailingMatch[0] : "";
        const cleanUrl = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;

        if (!cleanUrl) {
          return rawUrl;
        }

        return `<a href="${cleanUrl}" target="_blank" rel="noreferrer noopener">${truncateLinkLabel(cleanUrl, 30)}</a>${trailing}`;
      });
    })
    .join("");
}

function getArticleUrl(path: string): string {
  return `${PUBLIC_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getArticleShareLinks(title: string, path: string) {
  const url = getArticleUrl(path);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}

function ContactEmailIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M4 8.5L12 13.5L20 8.5" />
    </svg>
  );
}

function ContactTelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M20.58 4.37c.84-.33 1.63.32 1.41 1.18l-3.18 12.44c-.21.82-1.13 1.17-1.83.7l-4.04-2.73-2.06 2.02c-.51.49-1.38.24-1.54-.45l-1.21-5.03-4.03-1.47c-.93-.34-.97-1.64-.07-2.04L20.58 4.37zm-3.4 2.46L8.46 12.3a.75.75 0 00-.34.77l.73 3.03 1.08-1.06c.25-.24.64-.29.94-.1l3.96 2.68 2.35-9.79z" />
    </svg>
  );
}

function ContactTikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M16.76 3.2c.39 1.62 1.53 2.74 3.04 2.98v2.69a5.84 5.84 0 01-3-.86v6.03c0 3.2-2.32 5.6-5.48 5.6A5.53 5.53 0 015.8 14.1c0-3.12 2.34-5.53 5.4-5.53.39 0 .74.03 1.09.12v2.85a2.77 2.77 0 00-.98-.18 2.7 2.7 0 00-2.74 2.74c0 1.58 1.16 2.8 2.74 2.8 1.5 0 2.74-1.16 2.74-3.1V2.99h2.71z" />
    </svg>
  );
}

function ContactYouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M21.58 7.19a2.8 2.8 0 0 0-1.97-1.98C17.88 4.7 12 4.7 12 4.7s-5.88 0-7.61.51A2.8 2.8 0 0 0 2.42 7.2 29.2 29.2 0 0 0 1.9 12c0 1.64.18 3.23.52 4.8a2.8 2.8 0 0 0 1.97 1.98c1.73.51 7.61.51 7.61.51s5.88 0 7.61-.51a2.8 2.8 0 0 0 1.97-1.98A29.2 29.2 0 0 0 22.1 12c0-1.64-.18-3.23-.52-4.81ZM10.1 15.2V8.8l5.63 3.2-5.63 3.2Z" />
    </svg>
  );
}
function isRelativeMediaUrl(value: string): boolean {
  return value.startsWith("/");
}

function isAbsoluteMediaUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function parseGalleryItems(entries?: string[]) {
  return (entries ?? []).reduce<GalleryItem[]>((items, entry, index) => {
    const [rawUrl, rawCaption, rawAlt] = entry.split("|").map((part) => part.trim());
    if (!rawUrl || (!isAbsoluteMediaUrl(rawUrl) && !isRelativeMediaUrl(rawUrl))) {
      return items;
    }

    items.push({
      url: rawUrl,
      caption: rawCaption || undefined,
      alt: rawAlt || rawCaption || `Gallery image ${index + 1}`,
    });

    return items;
  }, []);
}

function extractIframeSrc(value: string): string | null {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function getVideoAsset(value?: string): { kind: "iframe" | "video"; src: string } | null {
  if (!value) {
    return null;
  }

  const candidate = extractIframeSrc(value) ?? value.trim();
  if (!candidate) {
    return null;
  }

  if (isRelativeMediaUrl(candidate) || /\.(mp4|webm|ogg)$/i.test(candidate)) {
    return { kind: "video", src: candidate };
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./, "");
    const pathname = url.pathname;

    if (/\.(mp4|webm|ogg)$/i.test(pathname)) {
      return { kind: "video", src: url.toString() };
    }

    if (hostname === "youtu.be") {
      const videoId = pathname.replace(/^\//, "");
      return videoId ? { kind: "iframe", src: `https://www.youtube.com/embed/${videoId}` } : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? { kind: "iframe", src: `https://www.youtube.com/embed/${videoId}` } : null;
      }

      const embedMatch = pathname.match(/^\/(embed|shorts)\/([^/?#]+)/);
      if (embedMatch?.[2]) {
        return { kind: "iframe", src: `https://www.youtube.com/embed/${embedMatch[2]}` };
      }
    }

    if (hostname === "player.vimeo.com") {
      return { kind: "iframe", src: url.toString() };
    }

    if (hostname === "vimeo.com") {
      const videoId = pathname.split("/").filter(Boolean).pop();
      return videoId ? { kind: "iframe", src: `https://player.vimeo.com/video/${videoId}` } : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getRawVideoSourceLink(value?: string): string | null {
  if (!value) {
    return null;
  }

  const candidate = extractIframeSrc(value) ?? value.trim();
  if (!candidate) {
    return null;
  }

  if (!/^https?:\/\//i.test(candidate)) {
    return null;
  }

  return candidate;
}

function getIngestSourceLabel(source?: string): string | null {
  if (!source) {
    return null;
  }

  if (source === "telegram") {
    return "Telegram ingest";
  }

  return source;
}

function getReadinessBadgeClassName(readiness?: string): string {
  const tone = getEditorialReadinessTone(readiness);

  if (tone === "warning") {
    return "rounded-full border border-[rgba(251,146,60,0.34)] px-2 py-1 text-[10px] tracking-[0.18em] text-orange-100/82";
  }

  if (tone === "progress") {
    return "rounded-full border border-[rgba(59,130,246,0.34)] px-2 py-1 text-[10px] tracking-[0.18em] text-sky-100/82";
  }

  return "rounded-full border border-[rgba(16,185,129,0.34)] px-2 py-1 text-[10px] tracking-[0.18em] text-emerald-100/82";
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  const categoryData = await getCategoryPageData(slug);
  if (categoryData) {
    return buildCategoryMetadata(categoryData.category);
  }

  const post = await getPostBySlug(slug);
  if (post) {
    return buildPostMetadata(post);
  }

  return {};
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const categoryData = await getCategoryPageData(slug);
  if (categoryData) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={categoryData.navigationItems} />
        <section className="rounded-lg border border-[rgba(111,231,255,0.2)] bg-[rgba(5,36,44,0.72)] p-6 shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md sm:p-8">
          <div className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-(--accent)">{categoryData.category.name}</div>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{categoryData.category.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200/82">
            {categoryData.category.description || `Výber článkov z kategórie ${categoryData.category.name}.`}
          </p>
          {categoryData.posts.some((post) => post.ingestSource === "telegram") ? (
            <div className="mt-6 inline-flex items-center rounded-lg border border-[rgba(111,231,255,0.18)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent)">
              Obsahuje Telegram ingest články
            </div>
          ) : null}
          {categoryData.posts.some((item) => item.editorialReadiness) ? (
            <div className="mt-3 inline-flex items-center rounded-lg border border-[rgba(251,146,60,0.22)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-orange-100/82">
              Obsahuje články v redakčnom workflow
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryData.posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,39,48,0.68)] p-4 backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent)">
                <span>{post.categoryLabel}</span>
                {post.ingestSource === "telegram" ? <span className="rounded-lg border border-[rgba(111,231,255,0.22)] px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">Telegram ingest</span> : null}
                {getEditorialReadinessLabel(post.editorialReadiness) ? <span className={getReadinessBadgeClassName(post.editorialReadiness)}>{getEditorialReadinessLabel(post.editorialReadiness)}</span> : null}
              </div>
              <Link href={post.href} className="block font-serif text-2xl leading-tight text-white transition-colors hover:text-(--accent)">{post.title}</Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-200/78">{post.excerpt}</p>
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-slate-300/60">{post.publishedAt}</p>
            </article>
          ))}
        </section>
      </main>
    );
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const relatedCategory = post.categorySlug ? await getCategoryPageData(post.categorySlug) : null;
  const navigationItems = await getNavigationItems(post.categorySlug || "domov");
  const explicitRelatedPosts = post.relatedPostIds?.length ? await getPostsByIds(post.relatedPostIds) : [];
  const relatedPosts = (explicitRelatedPosts.length > 0 ? explicitRelatedPosts : relatedCategory?.posts ?? [])
    .filter((relatedPost) => relatedPost.slug !== post.slug)
    .slice(0, 3);
  const shareLinks = getArticleShareLinks(post.title, post.href);
  const galleryItems = parseGalleryItems(post.gallery);
  const videoAsset = getVideoAsset(post.videoEmbed);
  const videoSourceLink = getRawVideoSourceLink(post.videoEmbed);
  const ingestSourceLabel = getIngestSourceLabel(post.ingestSource);
  const editorialReadinessLabel = getEditorialReadinessLabel(post.editorialReadiness);
  const sources = post.sources ?? [];
  const sourceAttribution = resolveSourceAttribution(post);
  const conclusionNumber = post.conclusionNumber?.trim() || "1";
  const conclusionText = post.conclusionText?.trim();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <SiteHeader navigationItems={navigationItems} />
      <article className="rounded-lg border border-[rgba(111,231,255,0.18)] bg-[linear-gradient(180deg,rgba(6,31,39,0.88),rgba(5,24,31,0.82))] shadow-[0_0_40px_rgba(80,226,255,0.06)] backdrop-blur-md">
        <div className="border-b border-[rgba(111,231,255,0.12)] px-6 py-5 sm:px-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-slate-300/62">
            <Link href="/" className="transition-colors hover:text-white">Domov</Link>
            <span className="text-(--accent)/70">/</span>
            <Link href={`/${post.categorySlug}`} className="transition-colors hover:text-white">{post.categoryLabel}</Link>
            <span className="text-(--accent)/70">/</span>
            <span className="text-slate-100/78">Článok</span>
          </nav>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-4xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {post.highlightBadge ? (
                <span className="rounded-lg border border-[rgba(111,231,255,0.22)] bg-[rgba(31,169,214,0.18)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">
                  {post.highlightBadge}
                </span>
              ) : null}
              <span className="font-sans text-xs uppercase tracking-[0.34em] text-(--accent)">{post.categoryLabel}</span>
              {post.articleType ? <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-slate-300/56">{post.articleType}</span> : null}
              {editorialReadinessLabel ? <span className={getReadinessBadgeClassName(post.editorialReadiness)}>{editorialReadinessLabel}</span> : null}
            </div>
            <h1 className="max-w-5xl font-serif text-4xl leading-[0.95] text-white sm:text-6xl xl:text-7xl">{post.title}</h1>
            {post.subtitle ? <p className="mt-6 max-w-4xl text-xl leading-relaxed text-slate-100/82 sm:text-2xl">{post.subtitle}</p> : null}
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-100/76 sm:text-xl">{post.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-[rgba(111,231,255,0.12)] py-4 font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/62">
              <span>Publikované {post.publishedAt}</span>
              <span className="h-1 w-1 rounded-full bg-(--accent)/70" />
              <span>{post.authorName || "Nový Matrix Media"}</span>
              {sourceAttribution ? <span className="h-1 w-1 rounded-full bg-(--accent)/70" /> : null}
              {sourceAttribution ? (
                sourceAttribution.url ? (
                  <a href={sourceAttribution.url} target="_blank" rel={EXTERNAL_LINK_REL} className="text-(--accent) transition-colors hover:text-white">
                    Zdroj: {sourceAttribution.name}
                  </a>
                ) : (
                  <span className="text-(--accent)">Zdroj: {sourceAttribution.name}</span>
                )
              ) : null}
              {post.estimatedReadingTime ? <span className="h-1 w-1 rounded-full bg-(--accent)/70" /> : null}
              {post.estimatedReadingTime ? <span>{post.estimatedReadingTime}</span> : null}
            </div>

            {sources.length > 0 ? (
              <section className="mt-6 rounded-lg border border-[rgba(111,231,255,0.12)] bg-[rgba(7,34,42,0.44)] px-4 py-3">
                <div className="mb-2 font-sans text-[10px] uppercase tracking-[0.22em] text-slate-300/58">Zdroje</div>
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-100/80">
                  {sources.map((source, index) => (
                    <span key={`${source.name}-${source.url ?? index}`}>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel={EXTERNAL_LINK_REL} className="text-(--accent) transition-colors hover:text-white">
                          {source.name}
                        </a>
                      ) : (
                        source.name
                      )}
                      {index < sources.length - 1 ? <span className="ml-3 text-slate-300/44">·</span> : null}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {post.imageUrl ? (
            <figure className="mt-10 overflow-hidden rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(8,35,42,0.72)]">
              <div className="relative h-72 w-full sm:h-112 xl:h-144">
                <Image
                  src={post.imageUrl}
                  alt={post.imageAlt}
                  fill
                  quality={92}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1200px"
                  priority
                />
              </div>
              {post.imageCaption || post.sourceName ? (
                <figcaption className="border-t border-[rgba(111,231,255,0.1)] px-5 py-4 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300/58">
                  {post.imageCaption || "Cover image"}
                  {post.sourceName ? (
                    <>
                      <span className="mx-2 text-(--accent)/70">/</span>
                      {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-white">{post.sourceName}</a> : post.sourceName}
                    </>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="mt-12 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">
              {post.factBox && post.factBox.length > 0 ? (
                <section className="mx-auto mb-10 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.72)] p-6">
                  <div className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Co je dolezite vediet</div>
                  <ul className="space-y-3 text-base leading-relaxed text-slate-100/84">
                    {post.factBox.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="article-body mx-auto max-w-3xl" dangerouslySetInnerHTML={renderHtml(post.content || `<p>${post.excerpt}</p>`)} />

              {conclusionText ? (
                <section className="mx-auto mt-10 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.56)] p-6">
                  <h2 className="font-serif text-3xl text-white"># Záver {conclusionNumber}</h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-100/84">{conclusionText}</p>
                </section>
              ) : null}

              {videoAsset ? (
                <section className="mx-auto mt-12 max-w-4xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.62)] p-4 sm:p-6">
                  <div className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Video</div>
                  <div className="overflow-hidden rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(3,18,24,0.92)]">
                    {videoAsset.kind === "iframe" ? (
                      <iframe
                        src={videoAsset.src}
                        title={`Video: ${post.title}`}
                        className="aspect-video w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <video className="aspect-video w-full" controls preload="metadata">
                        <source src={videoAsset.src} />
                        Váš prehliadač nepodporuje prehrávanie videa.
                      </video>
                    )}
                  </div>
                  {videoSourceLink ? (
                    <p className="mt-3 text-sm text-slate-300/80">
                      Odkaz na video:{" "}
                      <a
                        href={videoSourceLink}
                        target="_blank"
                        rel={EXTERNAL_LINK_REL}
                        className="text-(--accent) transition-colors hover:text-white"
                      >
                        {truncateLinkLabel(videoSourceLink, 30)}
                      </a>
                    </p>
                  ) : null}
                </section>
              ) : null}

              {galleryItems.length > 0 ? (
                <section className="mx-auto mt-12 max-w-5xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.4)] p-5 sm:p-6">
                  <div className="mb-5 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Galeria</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {galleryItems.map((item) => (
                      <figure key={`${item.url}-${item.alt}`} className="overflow-hidden rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(6,24,31,0.76)]">
                        <div className="relative h-80 w-full">
                          <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                        </div>
                        {item.caption ? (
                          <figcaption className="border-t border-[rgba(111,231,255,0.1)] px-4 py-3 text-sm leading-relaxed text-slate-200/72">
                            {item.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              {post.quoteBlock ? (
                <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.52)] p-8">
                  <div className="font-serif text-3xl leading-tight text-white sm:text-4xl">&ldquo;{post.quoteBlock}&rdquo;</div>
                </section>
              ) : null}

              {(post.tagLabels?.length ?? 0) > 0 ? (
                <section className="mx-auto mt-12 max-w-3xl border-t border-[rgba(111,231,255,0.12)] pt-6">
                  <div className="mb-4 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Tagy</div>
                  <div className="flex flex-wrap gap-3">
                    {post.tagLabels?.map((tag) => (
                      <span key={tag} className="rounded-lg border border-[rgba(111,231,255,0.18)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-100/74">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <ArticleComments postId={post.id} />

              <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[linear-gradient(135deg,rgba(8,39,47,0.84),rgba(11,58,70,0.62))] p-6">
                <div className="mb-3 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Kontakt / Tip redakcii</div>
                <p className="max-w-2xl text-base leading-relaxed text-slate-100/82">
                  Máte tip, doplnenie alebo reakciu k článku? Napíšte nám email alebo sledujte redakčné kanály na Telegrame a YouTube.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={getContactEmailHref()}
                    aria-label="Napísať email redakcii"
                    className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(8,52,64,0.38)] px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
                  >
                    <ContactEmailIcon className="h-4 w-4 text-(--accent)" />
                    <span>{CONTACT_EMAIL}</span>
                  </a>
                  <a
                    href={TELEGRAM_CHANNEL_URL}
                    target="_blank"
                    rel={EXTERNAL_LINK_REL}
                    aria-label="Telegram kanál NOVY MATRIX MEDIA"
                    className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(10,72,88,0.38)] px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
                  >
                    <ContactTelegramIcon className="h-4 w-4 text-(--accent)" />
                    <span>Telegram kanál</span>
                  </a>
                  <a
                    href={YOUTUBE_CHANNEL_URL}
                    target="_blank"
                    rel={EXTERNAL_LINK_REL}
                    aria-label="YouTube kanál NOVY MATRIX MEDIA"
                    className="inline-flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.26)] bg-[rgba(153,27,27,0.32)] px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-slate-100/86 transition-colors hover:border-[rgba(248,113,113,0.46)] hover:text-white"
                  >
                    <ContactYouTubeIcon className="h-4 w-4 text-red-200" />
                    <span>YouTube kanál</span>
                  </a>
                  <a
                    href={TIKTOK_PROFILE_URL}
                    target="_blank"
                    rel={EXTERNAL_LINK_REL}
                    aria-label="TikTok profil NOVY MATRIX MEDIA"
                    className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(7,49,62,0.36)] px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
                  >
                    <ContactTikTokIcon className="h-4 w-4 text-(--accent)" />
                    <span>TikTok profil</span>
                  </a>
                </div>
              </section>

              {ingestSourceLabel || editorialReadinessLabel || post.telegramChatTitle || post.telegramPermalink ? (
                <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.56)] p-6">
                  <div className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Redakčný pôvod</div>
                  <dl className="space-y-3 text-sm leading-relaxed text-slate-100/78">
                    {ingestSourceLabel ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Zdroj ingestu</dt>
                        <dd>{ingestSourceLabel}</dd>
                      </div>
                    ) : null}
                    {editorialReadinessLabel ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Redakčná pripravenosť</dt>
                        <dd>{editorialReadinessLabel}</dd>
                      </div>
                    ) : null}
                    {post.telegramChatTitle ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Telegram kanál</dt>
                        <dd>{post.telegramChatTitle}</dd>
                      </div>
                    ) : null}
                    {post.telegramAuthor ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Autor ingestu</dt>
                        <dd>{post.telegramAuthor}</dd>
                      </div>
                    ) : null}
                    {post.telegramMessageId ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Message ID</dt>
                        <dd>{post.telegramMessageId}</dd>
                      </div>
                    ) : null}
                    {post.telegramPermalink ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <dt className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300/58">Originál</dt>
                        <dd>
                          <a href={post.telegramPermalink} target="_blank" rel={EXTERNAL_LINK_REL} className="text-(--accent) transition-colors hover:text-white">
                            Otvoriť Telegram príspevok
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[linear-gradient(135deg,rgba(8,39,47,0.84),rgba(11,58,70,0.62))] p-8">
                <div className="mb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Ďalší obsah</div>
                <h2 className="font-serif text-3xl text-white sm:text-4xl">Sleduj ďalšie komentáre, analýzy a rýchle správy.</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-100/78">Pokračuj na domovskú stránku alebo si otvor ďalšie súvisiace texty z tejto sekcie.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/" className="rounded-lg border border-[rgba(111,231,255,0.22)] bg-[rgba(31,169,214,0.72)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-[rgba(31,169,214,0.9)]">Na domovskú stránku</Link>
                  <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel={EXTERNAL_LINK_REL} className="rounded-lg border border-[rgba(111,231,255,0.16)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-slate-100/78 transition-colors hover:border-(--accent) hover:text-white">Telegram kanál</a>
                  <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel={EXTERNAL_LINK_REL} className="rounded-lg border border-[rgba(248,113,113,0.26)] bg-[rgba(153,27,27,0.22)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-red-100/84 transition-colors hover:border-[rgba(248,113,113,0.46)] hover:text-white">YouTube kanál</a>
                  <a href={TIKTOK_PROFILE_URL} target="_blank" rel={EXTERNAL_LINK_REL} className="rounded-lg border border-[rgba(111,231,255,0.16)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-slate-100/78 transition-colors hover:border-(--accent) hover:text-white">TikTok profil</a>
                </div>
              </section>
            </div>

            <aside className="xl:block">
              <div className="sticky top-8 space-y-6">
                <section className="rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(7,34,42,0.72)] p-5">
                  <div className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Zdieľať</div>
                  <div className="space-y-3 font-sans text-xs uppercase tracking-[0.2em] text-slate-200/80">
                    <a href={shareLinks.telegram} target="_blank" rel={EXTERNAL_LINK_REL} className="flex items-center justify-between rounded-lg border border-[rgba(111,231,255,0.16)] px-4 py-3 transition-colors hover:border-(--accent) hover:text-white">
                      <span>Telegram</span>
                      <span className="text-(--accent)">01</span>
                    </a>
                    <a href={shareLinks.x} target="_blank" rel={EXTERNAL_LINK_REL} className="flex items-center justify-between rounded-lg border border-[rgba(111,231,255,0.16)] px-4 py-3 transition-colors hover:border-(--accent) hover:text-white">
                      <span>X / Twitter</span>
                      <span className="text-(--accent)">02</span>
                    </a>
                    <a href={shareLinks.email} className="flex items-center justify-between rounded-lg border border-[rgba(111,231,255,0.16)] px-4 py-3 transition-colors hover:border-(--accent) hover:text-white">
                      <span>Email</span>
                      <span className="text-(--accent)">03</span>
                    </a>
                  </div>
                </section>

                <section className="rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(7,34,42,0.72)] p-5">
                  <div className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Súvisiace</div>
                  <div className="space-y-5">
                    {relatedPosts.length > 0 ? relatedPosts.map((relatedPost) => (
                      <div key={relatedPost.id} className="border-b border-[rgba(111,231,255,0.08)] pb-4 last:border-b-0 last:pb-0">
                        <div className="mb-2 font-sans text-[10px] uppercase tracking-[0.24em] text-slate-300/58">{relatedPost.categoryLabel}</div>
                        <Link href={relatedPost.href} className="font-serif text-xl leading-tight text-white transition-colors hover:text-(--accent)">{relatedPost.title}</Link>
                      </div>
                    )) : (
                      <p className="text-sm leading-relaxed text-slate-200/72">Ďalšie články z tejto sekcie pribudnú po napojení plného CMS feedu.</p>
                    )}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}


