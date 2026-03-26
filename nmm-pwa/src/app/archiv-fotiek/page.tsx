import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import { getNavigationItems, getPhotoArchivePosts } from "@/lib/wp-queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Archív fotiek A-Z | Nový Matrix Media",
  description: "Abecedný archív článkov s fotografiami.",
  alternates: {
    canonical: "https://novymatrixmedia.sk/archiv-fotiek",
  },
};

function getGroupKey(title: string): string {
  const normalized = title
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();

  const first = normalized.charAt(0);
  return /^[A-Z]$/.test(first) ? first : "#";
}

export default async function PhotoArchivePage() {
  const [navigationItems, posts] = await Promise.all([
    getNavigationItems("archiv-fotiek"),
    getPhotoArchivePosts(),
  ]);

  const grouped = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = getGroupKey(post.title);
    const current = grouped.get(key) ?? [];
    current.push(post);
    grouped.set(key, current);
  }

  const orderedKeys = Array.from(grouped.keys()).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b, "sk");
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SiteHeader navigationItems={navigationItems} />

      <section className="mt-8 rounded-lg border border-[rgba(111,231,255,0.2)] bg-[rgba(5,36,44,0.72)] p-6 shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md sm:p-8">
        <div className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-(--accent)">Archív</div>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Archív fotiek A-Z</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200/82">
          Všetky články s fotografiou zoradené podľa abecedy.
        </p>
      </section>

      <section className="mt-8 space-y-8">
        {orderedKeys.length === 0 ? (
          <p className="text-sm text-slate-300/74">Zatiaľ nie sú dostupné žiadne články s fotografiou.</p>
        ) : (
          orderedKeys.map((key) => (
            <section key={key} className="rounded-lg border border-[rgba(111,231,255,0.14)] bg-[rgba(7,39,48,0.62)] p-5 backdrop-blur-sm">
              <h2 className="mb-4 border-b border-[rgba(111,231,255,0.12)] pb-3 font-serif text-3xl text-white">{key}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(grouped.get(key) ?? []).map((post) => (
                  <article key={post.id} className="overflow-hidden rounded-lg border border-[rgba(111,231,255,0.12)] bg-[rgba(5,28,35,0.72)]">
                    <Link href={post.href} className="relative block h-44 w-full">
                      <Image
                        src={post.imageUrl}
                        alt={post.imageAlt}
                        fill
                        quality={90}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </Link>
                    <div className="p-4">
                      <Link href={post.href} className="block font-serif text-xl leading-tight text-white transition-colors hover:text-(--accent)">
                        {post.title}
                      </Link>
                      <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300/62">{post.publishedAt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
