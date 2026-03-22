import MatrixHero from "@/components/MatrixHero";

import { getHomePageData } from "@/lib/wp-queries";

export const revalidate = 300;

export default async function Home() {
  const data = await getHomePageData();

  return (
    <main>
      <MatrixHero data={data} />
    </main>
  );
}
