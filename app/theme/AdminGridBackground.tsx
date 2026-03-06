'use client';

import { useRef, useEffect } from 'react';

export default function AdminGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        const gridSize = 40; // Tighter grid for Admin

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
            maxLength: number;
        }

        const drops: Drop[] = [];
        const maxDrops = Math.floor(width / gridSize) * 4; // Double density compared to User Dashboard

        for (let i = 0; i < maxDrops; i++) {
            drops.push({
                x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                y: Math.random() * -height,
                speed: Math.random() * 5 + 3, // Much Faster
                opacity: Math.random() * 0.8 + 0.2, // Brighter
                history: [],
                maxLength: Math.floor(Math.random() * 30) + 10 // Longer trails
            });
        }

        let animationFrameId: number;

        const animate = () => {
            // Faster fade for motion blur effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, width, height);

            // Tech Grid (Faint)
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            // Horizontal scan lines
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            drops.forEach(drop => {
                drop.y += drop.speed;
                drop.history.push({ x: drop.x, y: drop.y });
                if (drop.history.length > drop.maxLength) drop.history.shift();

                // Random Turns - More chaotic for Admin
                if (Math.abs(drop.y % gridSize) < drop.speed && Math.random() > 0.92) { // More frequent turns
                    const turnDir = Math.random() > 0.5 ? 1 : -1;
                    const newX = drop.x + turnDir * gridSize;
                    if (newX > 0 && newX < width) {
                        // Zigzag
                        drop.history.push({ x: newX, y: drop.y });
                        drop.x = newX;
                    }
                }

                if (drop.y > height + 100) {
                    drop.y = Math.random() * -200;
                    drop.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
                    drop.history = [];
                    drop.speed = Math.random() * 5 + 3; // Randomize speed again
                }

                ctx.beginPath();
                // Intense Red/Orange for "Karak" feel
                ctx.strokeStyle = `rgba(255, 30, 30, ${drop.opacity})`;
                ctx.lineWidth = 3; // Thicker lines

                // Intense Glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(255, 0, 0, 1)';

                if (drop.history.length > 0) {
                    ctx.moveTo(drop.history[0].x, drop.history[0].y);
                    for (let i = 1; i < drop.history.length; i++) {
                        ctx.lineTo(drop.history[i].x, drop.history[i].y);
                    }
                    ctx.lineTo(drop.x, drop.y);
                }
                ctx.stroke();

                // Bright Leading Head
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(drop.x - 2, drop.y - 2, 4, 4);

                // Reset shadow
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-black pointer-events-none mix-blend-screen" />;
}
