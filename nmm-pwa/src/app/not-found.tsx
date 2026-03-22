import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-[rgba(111,231,255,0.2)] bg-[rgba(5,36,44,0.72)] p-8 text-center shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md sm:p-12">
        <div className="font-sans text-xs uppercase tracking-[0.35em] text-(--accent)">404 :: Nenájdené</div>
        <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Obsah sa nenašiel</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-200/82">
          Požadovaný článok alebo kategória momentálne nie je dostupná. Skontroluj URL alebo sa vráť na homepage.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-lg border border-[rgba(111,231,255,0.28)] bg-[rgba(31,169,214,0.72)] px-6 py-3 font-sans text-sm uppercase tracking-[0.24em] text-white transition-all hover:bg-[rgba(31,169,214,0.9)]">
          Späť na homepage
        </Link>
      </section>
    </main>
  );
}