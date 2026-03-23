import Link from "next/link";

import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SiteHeader from "@/components/SiteHeader";

import type { HomePageData, SitePost } from "@/types/wordpress";

interface MatrixHeroProps {
  data: HomePageData;
}

interface PostListColumnProps {
  title: string;
  posts: SitePost[];
  href: string;
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
          {posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-[rgba(111,231,255,0.08)] bg-[rgba(6,34,42,0.4)] p-3">
              <Link href={post.href} className="block font-serif text-lg leading-tight text-white transition-colors hover:text-(--accent)">
                {post.title}
              </Link>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-300/70">
                {post.publishedAt}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-300/74">Zatiaľ bez obsahu.</p>
      )}
    </article>
  );
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  return (
    <div className="relative z-10 min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={data.navigationItems} />

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

      <div className="matrix-only pointer-events-none fixed inset-0 z-50 hidden md:block bg-[linear-gradient(rgba(10,24,30,0)_52%,rgba(2,8,12,0.2)_52%),linear-gradient(90deg,rgba(74,191,207,0.03),rgba(9,100,120,0.015),rgba(160,220,232,0.035))] bg-size-[100%_2px,3px_100%] opacity-16" />
    </div>
  );
}
