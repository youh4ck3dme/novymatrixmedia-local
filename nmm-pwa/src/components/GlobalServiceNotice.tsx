import { EXTERNAL_LINK_REL, TELEGRAM_CHANNEL_URL, getContactEmailHref } from "@/lib/contact-links";

const WORDPRESS_ADMIN_URL = "https://info.novymatrixmedia.sk/wp-admin";

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3.8L21 19.4a1.2 1.2 0 0 1-1.04 1.8H4.04A1.2 1.2 0 0 1 3 19.4L12 3.8Z" />
      <path d="M12 9v4.8" strokeLinecap="round" />
      <circle cx="12" cy="17.25" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function GlobalServiceNotice() {
  return (
    <section className="border-b border-[rgba(248,196,89,0.2)] bg-[linear-gradient(180deg,rgba(63,32,10,0.96),rgba(22,16,8,0.94))]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-xl border border-[rgba(248,196,89,0.28)] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),rgba(41,24,8,0.92)_65%)] p-4 shadow-[0_18px_48px_rgba(245,158,11,0.08)] lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(253,224,71,0.24)] bg-[rgba(120,53,15,0.36)] px-3 py-1 font-sans text-[10px] uppercase tracking-[0.24em] text-amber-100/92">
              <WarningIcon className="h-3.5 w-3.5" />
              Docasny oznam
            </div>
            <p className="mt-3 max-w-3xl font-serif text-2xl leading-tight text-white sm:text-3xl">
              Frontend moze byt docasne obmedzeny kvoli problemu s Vercel billingom.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-50/84 sm:text-base">
              Ak sa stranka nenasitala korektne alebo si videl Vercel hlasku o pozastavenom deployi,
              nejde o chybu na tvojej strane. Na obnoveni sluzby pracujeme.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                className="inline-flex items-center rounded-xl border border-[rgba(253,224,71,0.3)] bg-[rgba(180,83,9,0.44)] px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] text-amber-50 transition-colors hover:bg-[rgba(217,119,6,0.62)]"
              >
                Aktuality cez Telegram
              </a>
              <a
                href={getContactEmailHref()}
                className="inline-flex items-center rounded-xl border border-[rgba(253,224,71,0.2)] px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-amber-100/88 transition-colors hover:border-[rgba(253,224,71,0.36)] hover:text-white"
              >
                Kontaktovat redakciu
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(253,224,71,0.18)] bg-[rgba(34,24,10,0.54)] p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-amber-100/68">
              Pre admina a redakciu
            </div>
            <p className="mt-3 text-sm leading-relaxed text-amber-50/82">
              WordPress CMS a editorialna praca ostavaju dostupne cez administraciu na
              {" "}
              <span className="font-semibold text-white">info.novymatrixmedia.sk</span>.
            </p>
            <a
              href={WORDPRESS_ADMIN_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              className="mt-4 inline-flex items-center rounded-xl border border-[rgba(253,224,71,0.28)] bg-[rgba(120,53,15,0.32)] px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.2em] text-amber-50 transition-colors hover:bg-[rgba(180,83,9,0.5)]"
            >
              Otvorit WordPress CMS
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
