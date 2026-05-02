import type { ReactNode } from "react";

import {
  CONTACT_EMAIL,
  EXTERNAL_LINK_REL,
  TELEGRAM_CHANNEL_URL,
  TIKTOK_PROFILE_URL,
  YOUTUBE_CHANNEL_URL,
  getContactEmailHref,
} from "@/lib/contact-links";

type SocialLinkKey = "telegram" | "youtube" | "tiktok" | "email";

interface SocialLinksRowProps {
  include?: SocialLinkKey[];
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  emailLabel?: string;
  onItemClick?: () => void;
}

interface SocialLinkConfig {
  key: SocialLinkKey;
  href: string;
  label: string;
  ariaLabel: string;
  icon: (className?: string) => ReactNode;
}

function EmailIcon({ className }: { className?: string }) {
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

function TelegramIcon({ className }: { className?: string }) {
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

function TikTokIcon({ className }: { className?: string }) {
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

const DEFAULT_INCLUDE: SocialLinkKey[] = ["telegram", "tiktok", "youtube", "email"];

export default function SocialLinksRow({
  include = DEFAULT_INCLUDE,
  className,
  itemClassName,
  iconClassName,
  emailLabel = CONTACT_EMAIL,
  onItemClick,
}: SocialLinksRowProps) {
  const ordered = DEFAULT_INCLUDE.filter((key) => include.includes(key));
  const links: SocialLinkConfig[] = ordered.map((key) => {
    if (key === "telegram") {
      return {
        key,
        href: TELEGRAM_CHANNEL_URL,
        label: "Telegram",
        ariaLabel: "Telegram kanál NOVY MATRIX MEDIA",
        icon: (iconStyles) => <TelegramIcon className={iconStyles} />,
      };
    }

    if (key === "tiktok") {
      return {
        key,
        href: TIKTOK_PROFILE_URL,
        label: "TikTok",
        ariaLabel: "TikTok profil NOVY MATRIX MEDIA",
        icon: (iconStyles) => <TikTokIcon className={iconStyles} />,
      };
    }

    if (key === "youtube") {
      return {
        key,
        href: YOUTUBE_CHANNEL_URL,
        label: "YouTube",
        ariaLabel: "YouTube kanál NOVY MATRIX MEDIA",
        icon: (iconStyles) => <YouTubeIcon className={iconStyles} />,
      };
    }

    return {
      key,
      href: getContactEmailHref(),
      label: emailLabel,
      ariaLabel: "Napísať email redakcii NOVY MATRIX MEDIA",
      icon: (iconStyles) => <EmailIcon className={iconStyles} />,
    };
  });

  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target={link.key === "email" ? undefined : "_blank"}
          rel={link.key === "email" ? undefined : EXTERNAL_LINK_REL}
          onClick={onItemClick}
          aria-label={link.ariaLabel}
          className={itemClassName || "inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-cyan-500/60 hover:text-white"}
        >
          {link.icon(iconClassName || "h-3.5 w-3.5 text-cyan-400")}
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}
