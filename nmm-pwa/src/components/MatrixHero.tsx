"use client";

import React from "react";

export default function MatrixHero() {
  const currentDate = new Date().toLocaleDateString("sk-SK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).toUpperCase();

  return (
    <div className="relative z-10 min-h-screen text-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="py-6 border-b-2 border-gray-800">
          <div className="flex justify-between items-end mb-4">
            <div className="font-mono text-xs text-[#00ff41] tracking-widest hidden md:block">
              EDÍCIA: BRATISLAVA // {currentDate}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-white text-center flex-grow uppercase">
              Nový Matrix{" "}
              <span className="font-mono text-[#00ff41] font-normal tracking-widest text-3xl md:text-5xl ml-2">
                Media
              </span>
            </h1>
            <div className="font-mono text-xs text-gray-500 tracking-widest hidden md:block text-right">
              VERZIA: 2.0.26<br />STATUS: ONLINE
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 md:gap-8 font-mono text-sm uppercase tracking-widest border-t border-b border-gray-800 py-3">
            <a href="#" className="hover:text-[#00ff41] transition-colors">Domov</a>
            <a href="#" className="hover:text-[#00ff41] transition-colors">Politika</a>
            <a href="#" className="text-[#00ff41] font-bold">Zahraničie</a>
            <a href="#" className="hover:text-[#00ff41] transition-colors">Komentáre</a>
            <a href="#" className="hover:text-[#00ff41] transition-colors">Kyber-Bezpečnosť</a>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <main className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LAVA STRANA: Hlavne spravy (8 stlpcov) */}
          <div className="lg:col-span-8 flex flex-col gap-10">

            {/* HERO Clanok */}
            <article className="group cursor-pointer">
              <div className="overflow-hidden border border-gray-800 relative">
                <div className="absolute inset-0 bg-[#00ff41]/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                <img
                  src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop"
                  alt="Hlavna sprava"
                  className="w-full h-[450px] object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3 font-mono text-xs">
                  <span className="bg-[#00ff41] text-black px-2 py-0.5 font-bold">ANALÝZA</span>
                  <span className="text-gray-500">AUTOR: KODEX ALPHA</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-white group-hover:text-[#00ff41] transition-colors leading-[1.1] mb-4">
                  Premiér hrozí ďalšími opatreniami. Únia blokuje 90 miliardový balík pre ropovod Družba.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed font-sans max-w-3xl">
                  Energetická kríza naberá na obrátkach. Vládny kabinet po nočnom zasadaní naznačil odvetné kroky.
                  Analytici varujú, že odstavenie digitálnej infraštruktúry by mohlo mať katastrofálne následky pre strednú Európu.
                </p>
              </div>
            </article>

            <hr className="border-gray-800" />

            {/* Sub-clanky */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&auto=format&fit=crop"
                  alt="Spravy"
                  className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 mb-4 border border-gray-900"
                />
                <h3 className="text-2xl font-serif text-white group-hover:text-[#00ff41] leading-tight mb-2">
                  Najvyšší súd nerozhodol o zákonnosti Trumpových cieľov
                </h3>
                <p className="font-mono text-xs text-gray-500">ZAHRANIČIE // 9. JAN 2026</p>
              </article>

              <article className="group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop"
                  alt="Ekonomika"
                  className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 mb-4 border border-gray-900"
                />
                <h3 className="text-2xl font-serif text-white group-hover:text-[#00ff41] leading-tight mb-2">
                  Straty v dôsledku sankcií proti Rusku sú pre EÚ likvidačné
                </h3>
                <p className="font-mono text-xs text-gray-500">EKONOMIKA // 9. JAN 2026</p>
              </article>
            </div>
          </div>

          {/* PRAVA STRANA: POL-NET FEED */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 border border-gray-800 bg-black/80 backdrop-blur-md p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#00ff41]" />

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                <div className="w-2.5 h-2.5 bg-[#00ff41] animate-pulse rounded-sm" />
                <h3 className="font-mono text-[#00ff41] text-lg tracking-widest uppercase">
                  Pol-Net_Feed
                </h3>
              </div>

              <div className="flex flex-col gap-6 font-mono text-sm">
                <div className="relative pl-4 border-l border-gray-700 hover:border-[#00ff41] transition-colors group">
                  <span className="text-[#00ff41] text-xs mb-1 block opacity-70">16:21 :: Z DOMOVA</span>
                  <a href="#" className="text-gray-300 group-hover:text-white leading-relaxed">
                    Nové hygienické centrum v Rudňanoch zvyšuje dôstojnosť a pomáha rodinám.
                  </a>
                </div>

                <div className="relative pl-4 border-l border-[#00ff41] group">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 bg-[#00ff41]" />
                  <span className="text-[#00ff41] text-xs mb-1 block font-bold">16:05 :: BLESKOVÁ SPRÁVA</span>
                  <a href="#" className="text-white font-bold leading-relaxed">
                    Blaha: Nie, Putin nemôže za to, akí ste pokrytci, v debate sa oprel o Vondru a Lexmann.
                  </a>
                </div>

                <div className="relative pl-4 border-l border-gray-700 hover:border-[#00ff41] transition-colors group">
                  <span className="text-[#00ff41] text-xs mb-1 block opacity-70">15:40 :: KOMENTAR</span>
                  <a href="#" className="text-gray-300 group-hover:text-white leading-relaxed">
                    Uzavretie Hormuzského prielivu by priamo ohrozilo energetickú bezpečnosť SR.
                  </a>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-transparent border border-[#00ff41]/30 text-[#00ff41] font-mono text-sm hover:bg-[#00ff41] hover:text-black transition-all">
                [ INIT_LOAD_MORE ]
              </button>
            </div>
          </aside>

        </main>
      </div>

      {/* CRT Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] opacity-30" />
    </div>
  );
}
