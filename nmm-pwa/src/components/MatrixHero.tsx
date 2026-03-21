"use client";

import React from "react";
import { motion } from "framer-motion";

const MatrixHero: React.FC = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-6 bg-black/80">
            {/* Decorative Overlays */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGFdjZEADjAyMDIzIDGQBAyMDEwMDIwMqA1lAAVUAVUABVUBBAAB7AgMLu9V9fAAAAABJRU5ErkJggg==')] opacity-[0.15] bg-repeat" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-4xl w-full text-center space-y-8 p-12 rounded-lg border border-[#00ff41]/30 bg-black/40 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,65,0.15)]"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex justify-center mb-12"
                >
                    {/* Logo Placeholder with glow */}
                    <div className="text-6xl font-black text-[#00ff41] drop-shadow-[0_0_20px_rgba(0,255,65,0.5)] tracking-tighter uppercase font-mono">
                        NMM<span className="text-[#00aeef]">_</span>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <motion.h1
                        className="text-5xl md:text-7xl font-mono text-[#00ff41] uppercase tracking-widest font-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        Nový Matrix Media
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            _
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl font-mono text-[#00aeef] tracking-tight max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 1 }}
                    >
                        Informačno-publicistický portál v novom rozmere. Budúcnosť je už tu, len nie je rovnomerne distribuovaná.
                    </motion.p>
                </div>

                <motion.div
                    className="pt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                >
                    <button className="px-10 py-4 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-mono text-lg uppercase tracking-widest hover:bg-[#00ff41] hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_40px_rgba(0,255,65,0.4)]">
                        Vstúpiť do Matrixu
                    </button>
                </motion.div>
            </motion.div>

            {/* CRT Scanline effect */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] opacity-50" />
        </div>
    );
};

export default MatrixHero;
