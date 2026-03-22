"use client";

import React, { useEffect, useRef } from "react";

import { FRONTEND_VARIANT_CHANGE_EVENT, readBrowserFrontendVariant, type FrontendVariant } from "@/lib/frontend-variant";

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const variantRef = useRef<FrontendVariant>("default");

    useEffect(() => {
        const syncVariant = () => {
            variantRef.current = readBrowserFrontendVariant();
        };

        const handleVariantChange = (event: Event) => {
            const customEvent = event as CustomEvent<FrontendVariant>;
            variantRef.current = customEvent.detail === "matrix" ? "matrix" : "default";
        };

        syncVariant();
        window.addEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);

        const canvas = canvasRef.current;
        if (!canvas) {
            return () => window.removeEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return () => window.removeEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);
        }

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
        const fontSize = 16;
        let drops: number[] = [];
        let intervalId: ReturnType<typeof setInterval>;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const columns = Math.floor(canvas.width / fontSize);
            drops = Array.from({ length: columns }, () => 1);
        };

        const draw = () => {
            if (variantRef.current !== "matrix") {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.fillStyle = "rgba(2, 14, 20, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                const rand = Math.random();
                if (rand > 0.985) ctx.fillStyle = "#d0e6ea";
                else if (rand > 0.92) ctx.fillStyle = "#4abfcf";
                else ctx.fillStyle = "#0a4f5e";
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const handleResize = () => {
            clearInterval(intervalId);
            init();
            intervalId = setInterval(draw, 33);
        };

        init();
        intervalId = setInterval(draw, 33);
        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChange as EventListener);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="matrix-only fixed top-0 left-0 h-full w-full -z-10 opacity-[0.12] pointer-events-none"
        />
    );
};

export default MatrixBackground;
