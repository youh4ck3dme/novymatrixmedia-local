import type { Metadata } from "next";

import MatrixHero from "@/components/MatrixHero";

import { getHomePageData } from "@/lib/wp-queries";
import { buildHomeMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomePageData();
  return buildHomeMetadata(data);
}

export default async function Home() {
  const data = await getHomePageData();

  return <MatrixHero data={data} />;
}
