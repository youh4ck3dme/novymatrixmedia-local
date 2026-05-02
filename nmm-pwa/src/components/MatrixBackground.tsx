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

        syncVariant();

        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
        const fontSize = 16;
        let drops: number[] = [];
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const columns = Math.floor(canvas.width / fontSize);
            drops = Array.from({ length: columns }, () => 1);
        };

        const draw = () => {
            if (variantRef.current !== "matrix") return;

      ctx.fillStyle = "#02061714";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                const rand = Math.random();
                if (rand > 0.985) ctx.fillStyle = "#d0e6ea";
                else if (rand > 0.92) ctx.fillStyle = "#3d6dcc";
                else ctx.fillStyle = "#0a4f5e";
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const stopAnimation = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        const startAnimation = () => {
            if (intervalId || variantRef.current !== "matrix") {
                return;
            }
            intervalId = setInterval(draw, 33);
        };

        const syncAnimationState = () => {
            if (variantRef.current === "matrix") {
                startAnimation();
            } else {
                stopAnimation();
            }
        };

        const handleResize = () => {
            init();
            syncAnimationState();
        };

        const handleVariantChangeForAnimation = (event: Event) => {
            const customEvent = event as CustomEvent<FrontendVariant>;
            variantRef.current = customEvent.detail === "matrix" ? "matrix" : "default";
            syncAnimationState();
        };

        window.addEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChangeForAnimation as EventListener);

        init();
        syncAnimationState();
        window.addEventListener("resize", handleResize);

        return () => {
            stopAnimation();
            window.removeEventListener("resize", handleResize);
            window.removeEventListener(FRONTEND_VARIANT_CHANGE_EVENT, handleVariantChangeForAnimation as EventListener);
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
