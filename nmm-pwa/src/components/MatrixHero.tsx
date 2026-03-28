import Link from "next/link";

import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SiteHeader from "@/components/SiteHeader";

import { EXTERNAL_LINK_REL, TELEGRAM_CHANNEL_URL, YOUTUBE_CHANNEL_URL } from "@/lib/contact-links";
import { resolveSourceAttribution } from "@/lib/source-attribution";
import type { HomePageData, SitePost } from "@/types/wordpress";

interface MatrixHeroProps {
  data: HomePageData;
}

interface PostListColumnProps {
  title: string;
  posts: SitePost[];
  href: string;
}

function YouTubeIcon({ className }: { className?: string }) {
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

function PostListColumn({ title, posts, href }: PostListColumnProps) {
  return (
    <article className="rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(5,30,38,0.62)] p-5 md:backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.08)] pb-3">
        <h3 className="font-serif text-xl text-white">{title}</h3>
        <Link href={href} className="font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent) transition-colors hover:text-white">
          Viac
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const sourceAttribution = resolveSourceAttribution(post);

            return (
              <article key={post.id} className="rounded-lg border border-[rgba(111,231,255,0.08)] bg-[rgba(6,34,42,0.4)] p-3">
                <Link href={post.href} className="block font-serif text-lg leading-tight text-white transition-colors hover:text-(--accent)">
                  {post.title}
                </Link>
                <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300/70">
                  {post.publishedAt}
                </p>
                {sourceAttribution ? (
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.16em] text-slate-300/66">
                    Zdroj: {sourceAttribution.name}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-300/74">Zatiaľ bez obsahu.</p>
      )}
    </article>
  );
}

function VideoNewsroomPanel({ videoPosts }: { videoPosts: SitePost[] }) {
  const topVideoPosts = videoPosts.slice(0, 3);

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-[rgba(248,113,113,0.25)] bg-[radial-gradient(circle_at_20%_0%,rgba(239,68,68,0.22),rgba(6,26,34,0.92)_56%)] p-6 shadow-[0_20px_50px_rgba(127,29,29,0.22)] sm:p-7">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(248,113,113,0.35)] bg-[rgba(153,27,27,0.34)] px-3 py-1 font-sans text-[10px] uppercase tracking-[0.22em] text-red-100/92">
            <YouTubeIcon className="h-3.5 w-3.5" />
            YouTube newsroom
          </div>
          <h3 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl">
            Krátke správy, komentáre a video formát na jednom mieste.
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-50/86 sm:text-base">
            Sleduj oficiálny kanál NOVY MATRIX MEDIA a maj nové video výstupy okamžite po publikovaní.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(248,113,113,0.44)] bg-[rgba(185,28,28,0.58)] px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-red-50 transition-colors hover:bg-[rgba(220,38,38,0.75)]"
            >
              <YouTubeIcon className="h-4 w-4" />
              Odoberať YouTube
            </a>
            <Link
              href="/video"
              className="inline-flex items-center rounded-xl border border-[rgba(248,113,113,0.3)] px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-red-100/90 transition-colors hover:border-[rgba(248,113,113,0.5)] hover:text-white"
            >
              Otvoriť video sekciu
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(248,113,113,0.24)] bg-[rgba(41,11,20,0.56)] p-4">
          <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.2em] text-red-100/76">Najnovšie video titulky</div>
          {topVideoPosts.length > 0 ? (
            <div className="space-y-3">
              {topVideoPosts.map((post, index) => (
                <article key={post.id} className="rounded-lg border border-[rgba(248,113,113,0.16)] bg-[rgba(20,8,14,0.42)] p-3">
                  <div className="mb-2 flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-red-100/66">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-1 w-1 rounded-full bg-red-200/60" />
                    <span>{post.publishedAt}</span>
                  </div>
                  <Link href={post.href} className="font-serif text-base leading-snug text-white transition-colors hover:text-red-100">
                    {post.title}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-red-100/78">Zatiaľ nemáme pripravené video články.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickAccessStrip() {
  return (
    <section className="mt-6 rounded-xl border border-[rgba(111,231,255,0.1)] bg-[rgba(5,30,38,0.56)] px-4 py-3 md:backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-slate-300/64">Rýchly prístup</span>
        <a
          href={TELEGRAM_CHANNEL_URL}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(10,72,88,0.3)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-100/86 transition-colors hover:border-(--accent) hover:text-white"
        >
          Telegram
        </a>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.24)] bg-[rgba(153,27,27,0.26)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-red-100/88 transition-colors hover:border-[rgba(248,113,113,0.44)] hover:text-white"
        >
          <YouTubeIcon className="h-3.5 w-3.5 text-red-200" />
          YouTube
        </a>
        <Link
          href="/video"
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(111,231,255,0.16)] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-100/82 transition-colors hover:border-(--accent) hover:text-white"
        >
          Video sekcia
        </Link>
      </div>
    </section>
  );
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  return (
    <div className="home-ambient-wrap relative min-h-screen text-slate-100">
      <div aria-hidden className="home-matrix-ambient">
        <div className="home-matrix-rail home-matrix-rail--left" />
        <div className="home-matrix-rail home-matrix-rail--right" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={data.navigationItems} />
        <QuickAccessStrip />

        <main className="space-y-10 py-8">
          <section>
            {data.featuredPost ? (
              <FeaturedPost post={data.featuredPost} />
            ) : (
              <section className="rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(4,30,38,0.60)] p-6 md:backdrop-blur-md sm:p-8">
                <div className="font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Žiadny featured článok</div>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
                  WordPress nevrátil žiadne publikované články pre domovskú stránku.
                </h2>
              </section>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-[rgba(111,231,255,0.08)] pb-3">
              <h2 className="font-serif text-3xl text-white">Najnovšie články</h2>
              <Link href="/domov" className="font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent) transition-colors hover:text-white">
                Prejsť na články
              </Link>
            </div>
            {data.latestPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.latestPosts.slice(0, 6).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300/74">Najnovšie články zatiaľ nie sú dostupné.</p>
            )}
          </section>

          <section>
            <div className="mb-5 border-b border-[rgba(111,231,255,0.08)] pb-3">
              <h2 className="font-serif text-3xl text-white">Sekcie</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <PostListColumn title="Domov" posts={data.domovPosts.slice(0, 3)} href="/domov" />
              <PostListColumn title="Zahraničie" posts={data.zahraniciePosts.slice(0, 3)} href="/zahranicie" />
              <PostListColumn title="Najčítanejšie" posts={data.mostReadPosts.slice(0, 5)} href="/domov" />
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-[rgba(111,231,255,0.08)] pb-3">
              <h2 className="font-serif text-3xl text-white">Video</h2>
              <Link href="/video" className="font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent) transition-colors hover:text-white">
                Všetky videá
              </Link>
            </div>

            <VideoNewsroomPanel videoPosts={data.videoPosts} />

            {data.videoPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {data.videoPosts.slice(0, 4).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300/74">Video sekcia zatiaľ nemá články s vyplneným video linkom.</p>
            )}
          </section>

          <section className="rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(5,30,38,0.62)] p-6 md:backdrop-blur-md">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-[rgba(111,231,255,0.08)] pb-3">
              <h2 className="font-serif text-3xl text-white">Reakcie</h2>
              <Link href="/reakcie" className="font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent) transition-colors hover:text-white">
                Všetky reakcie
              </Link>
            </div>

            {data.recentComments.length > 0 ? (
              <div className="space-y-4">
                {data.recentComments.map((comment) => (
                  <article key={comment.id} className="rounded-lg border border-[rgba(111,231,255,0.08)] bg-[rgba(6,34,42,0.4)] p-4">
                    <div className="mb-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300/70">
                      {comment.authorName} · {comment.dateLabel}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-100/86">{comment.excerpt}</p>
                    {comment.postHref && comment.postTitle ? (
                      <Link href={comment.postHref} className="mt-3 inline-block font-sans text-[11px] uppercase tracking-[0.2em] text-(--accent) transition-colors hover:text-white">
                        K článku: {comment.postTitle}
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300/74">Zatiaľ nie sú schválené komentáre.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
