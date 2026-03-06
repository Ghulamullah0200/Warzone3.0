'use client';

import { useRef, useEffect } from 'react';

export default function GridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        const gridSize = 40;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        interface Drop {
            x: number;
            y: number;
            speed: number;
            opacity: number;
            history: { x: number; y: number }[];
        }

        const drops: Drop[] = [];
        const maxDrops = Math.floor(width / gridSize) * 2;

        for (let i = 0; i < maxDrops; i++) {
            drops.push({
                x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                y: Math.random() * -height,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1,
                history: [],
            });
        }

        let animationFrameId: number;

        const animate = () => {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
            ctx.fillRect(0, 0, width, height);

            // Red Grid
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            drops.forEach(drop => {
                drop.y += drop.speed;
                drop.history.push({ x: drop.x, y: drop.y });
                if (drop.history.length > 20) drop.history.shift();

                if (Math.abs(drop.y % gridSize) < drop.speed && Math.random() > 0.98) {
                    const turnDir = Math.random() > 0.5 ? 1 : -1;
                    const newX = drop.x + turnDir * gridSize;
                    if (newX > 0 && newX < width) {
                        drop.history.push({ x: newX, y: drop.y });
                        drop.x = newX;
                    }
                }

                if (drop.y > height + 50) {
                    drop.y = Math.random() * -100;
                    drop.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
                    drop.history = [];
                }

                ctx.beginPath();
                // Dark Red color for the lines (Dark Crimson)
                ctx.strokeStyle = `rgba(160, 10, 10, ${drop.opacity})`;
                ctx.lineWidth = 2;

                // Full Shadow / Glow Effect on Lines
                ctx.shadowBlur = 25;
                ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'; // Intense Red Glow

                if (drop.history.length > 0) {
                    ctx.moveTo(drop.history[0].x, drop.history[0].y);
                    for (let i = 1; i < drop.history.length; i++) {
                        ctx.lineTo(drop.history[i].x, drop.history[i].y);
                    }
                    ctx.lineTo(drop.x, drop.y);
                }
                ctx.stroke();

                // Dark Red Head
                ctx.fillStyle = '#8B0000'; // Dark Red
                // Shadow handles the glow
                ctx.fillRect(drop.x - 3, drop.y - 3, 6, 6);
                ctx.shadowBlur = 0; // Reset shadow for next frame
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-black pointer-events-none" />;
}
