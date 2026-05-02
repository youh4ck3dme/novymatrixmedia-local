import Link from "next/link";

import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SiteHeader from "@/components/SiteHeader";
import SocialLinksRow from "@/components/SocialLinksRow";
import { EXTERNAL_LINK_REL, YOUTUBE_CHANNEL_URL } from "@/lib/contact-links";
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

const SECTION_PANEL_CLASS_NAME = "relative rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl shadow-slate-950/50 backdrop-blur-md md:p-6";

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
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h3 className="font-serif text-xl text-white">{title}</h3>
        <Link href={href} className="font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400 transition-colors hover:text-white">
          Viac
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const sourceAttribution = resolveSourceAttribution(post);

            return (
              <article key={post.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <Link href={post.href} className="block font-serif text-lg leading-tight text-white transition-colors hover:text-cyan-400">
                  {post.title}
                </Link>
                <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  {post.publishedAt}
                </p>
                {sourceAttribution ? (
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    Zdroj: {sourceAttribution.name}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-300">Zatiaľ bez obsahu.</p>
      )}
    </article>
  );
}

function VideoNewsroomPanel({ videoPosts }: { videoPosts: SitePost[] }) {
  const topVideoPosts = videoPosts.slice(0, 3);

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-slate-700 bg-[linear-gradient(140deg,#0f172a_0%,#0b2448_52%,#020617_100%)] p-6 shadow-2xl shadow-slate-950/60 sm:p-7">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900 px-3 py-1 font-sans text-[10px] uppercase tracking-[0.22em] text-cyan-400">
            <YouTubeIcon className="h-3.5 w-3.5" />
            YouTube newsroom
          </div>
          <h3 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl">
            Krátke správy, komentáre a video formát na jednom mieste.
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Sleduj oficiálny kanál NOVY MATRIX MEDIA a maj nové video výstupy okamžite po publikovaní.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/55 bg-slate-900 px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:border-blue-600 hover:text-white"
            >
              <YouTubeIcon className="h-4 w-4" />
              Odoberať YouTube
            </a>
            <Link
              href="/video"
              className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white"
            >
              Otvoriť video sekciu
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
          <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.2em] text-slate-300">Najnovšie video titulky</div>
          {topVideoPosts.length > 0 ? (
            <div className="space-y-3">
              {topVideoPosts.map((post, index) => (
                <article key={post.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <div className="mb-2 flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                    <span>{post.publishedAt}</span>
                  </div>
                  <Link href={post.href} className="font-serif text-base leading-snug text-white transition-colors hover:text-cyan-400">
                    {post.title}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-300">Zatiaľ nemáme pripravené video články.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickAccessStrip() {
  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-3 md:backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-slate-400">Rýchly prístup</span>
        <SocialLinksRow
          include={["telegram", "youtube"]}
          className="flex flex-wrap items-center gap-2"
          itemClassName="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white"
          iconClassName="h-3.5 w-3.5 text-cyan-400"
        />
        <Link
          href="/video"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white"
        >
          Video sekcia
        </Link>
      </div>
    </section>
  );
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  return (
    <div className="relative isolate min-h-screen text-slate-100">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute left-[-8rem] top-[22rem] h-[22rem] w-[22rem] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-9rem] top-[46rem] h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={data.navigationItems} />
        <QuickAccessStrip />

        <main className="space-y-10 py-8">
          <section>
            {data.featuredPost ? (
              <FeaturedPost post={data.featuredPost} />
            ) : (
              <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 md:backdrop-blur-md sm:p-8">
                <div className="font-sans text-[11px] uppercase tracking-[0.28em] text-cyan-400">Žiadny featured článok</div>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
                  WordPress nevrátil žiadne publikované články pre domovskú stránku.
                </h2>
              </section>
            )}
          </section>

          <section className={SECTION_PANEL_CLASS_NAME}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-800 pb-3">
              <h2 className="font-serif text-3xl text-white drop-shadow-md">Najnovšie články</h2>
              <Link href="/domov" className="font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400 transition-colors hover:text-white">
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
              <p className="text-sm text-slate-300">Najnovšie články zatiaľ nie sú dostupné.</p>
            )}
          </section>

          <section className={SECTION_PANEL_CLASS_NAME}>
            <div className="mb-5 border-b border-slate-800 pb-3">
              <h2 className="font-serif text-3xl text-white drop-shadow-md">Sekcie</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <PostListColumn title="Domov" posts={data.domovPosts.slice(0, 3)} href="/domov" />
              <PostListColumn title="Zahraničie" posts={data.zahraniciePosts.slice(0, 3)} href="/zahranicie" />
              <PostListColumn title="Najčítanejšie" posts={data.mostReadPosts.slice(0, 5)} href="/domov" />
            </div>
          </section>

          <section className={SECTION_PANEL_CLASS_NAME}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-800 pb-3">
              <h2 className="font-serif text-3xl text-white drop-shadow-md">Video</h2>
              <Link href="/video" className="font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400 transition-colors hover:text-white">
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
              <p className="text-sm text-slate-300">Video sekcia zatiaľ nemá články s vyplneným video linkom.</p>
            )}
          </section>

          <section className={SECTION_PANEL_CLASS_NAME}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-800 pb-3">
              <h2 className="font-serif text-3xl text-white drop-shadow-md">Reakcie</h2>
              <Link href="/reakcie" className="font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400 transition-colors hover:text-white">
                Všetky reakcie
              </Link>
            </div>

            {data.recentComments.length > 0 ? (
              <div className="space-y-4">
                {data.recentComments.map((comment) => (
                  <article key={comment.id} className="rounded-lg border border-slate-800 bg-slate-900/90 p-4">
                    <div className="mb-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300">
                      {comment.authorName} · {comment.dateLabel}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-100">{comment.excerpt}</p>
                    {comment.postHref && comment.postTitle ? (
                      <Link href={comment.postHref} className="mt-3 inline-block font-sans text-[11px] uppercase tracking-[0.2em] text-cyan-400 transition-colors hover:text-white">
                        K článku: {comment.postTitle}
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300">Zatiaľ nie sú schválené komentáre.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
