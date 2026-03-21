"use client";

import React, { useEffect, useRef } from "react";

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
        const fontSize = 16;
        let drops: number[] = [];
        let intervalId: ReturnType<typeof setInterval>;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const columns = Math.floor(canvas.width / fontSize);
            drops = Array(columns).fill(1);
        };

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                const rand = Math.random();
                if (rand > 0.98) ctx.fillStyle = "#fff";
                else if (rand > 0.9) ctx.fillStyle = "#00ff41";
                else ctx.fillStyle = "#003b00";
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
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 opacity-[0.07] pointer-events-none"
        />
    );
};

export default MatrixBackground;
