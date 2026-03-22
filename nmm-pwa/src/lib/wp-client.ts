const DEFAULT_WP_URL = "http://localhost:8080";
const DEFAULT_PUBLIC_URL = "https://novymatrixmedia.sk";

export interface WordPressConfig {
  siteUrl: string;
  restUrl: string;
  graphqlUrl: string;
  publicSiteUrl: string;
}

export function getWordPressConfig(): WordPressConfig {
  const siteUrl = (process.env.NEXT_PUBLIC_WP_URL ?? DEFAULT_WP_URL).replace(/\/$/, "");
  const restUrl = (process.env.NEXT_PUBLIC_API_URL ?? `${siteUrl}/wp-json/wp/v2`).replace(/\/$/, "");
  const graphqlUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? `${siteUrl}/graphql`).replace(/\/$/, "");
  const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_PUBLIC_URL).replace(/\/$/, "");

  return {
    siteUrl,
    restUrl,
    graphqlUrl,
    publicSiteUrl,
  };
}

export function shouldUseWordPressFallback(config: WordPressConfig): boolean {
  const isBuildOnHostedPreview = Boolean(process.env.VERCEL);
  const pointsToLocalhost = /localhost|127\.0\.0\.1/.test(config.siteUrl);

  return pointsToLocalhost && isBuildOnHostedPreview;
}