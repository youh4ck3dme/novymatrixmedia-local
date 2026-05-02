import SiteHeaderClient from "@/components/SiteHeaderClient";
import type { SiteNavigationItem } from "@/types/wordpress";

interface SiteHeaderProps {
  navigationItems: SiteNavigationItem[];
}

export default function SiteHeader({ navigationItems }: SiteHeaderProps) {
  return <SiteHeaderClient navigationItems={navigationItems} />;
}
