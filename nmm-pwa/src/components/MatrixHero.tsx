import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SidebarFeed from "@/components/SidebarFeed";
import SiteHeader from "@/components/SiteHeader";

import type { HomePageData } from "@/types/wordpress";

interface MatrixHeroProps {
  data: HomePageData;
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  return (
    <div className="relative z-10 min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={data.navigationItems} />

        <main className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">

          <div className="flex flex-col gap-8 lg:col-span-8">
            <FeaturedPost post={data.featuredPost} />

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {data.secondaryPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          </div>

          <SidebarFeed posts={data.sidebarPosts} />

        </main>
      </div>

      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(10,24,30,0)_52%,rgba(2,8,12,0.2)_52%),linear-gradient(90deg,rgba(84,221,244,0.04),rgba(9,121,143,0.02),rgba(178,243,255,0.05))] bg-size-[100%_2px,3px_100%] opacity-25" />
    </div>
  );
}
