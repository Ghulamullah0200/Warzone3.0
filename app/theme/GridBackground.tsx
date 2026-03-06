'use client';

import { useEffect, useRef } from 'react';

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
    handleResize();
    window.addEventListener('resize', handleResize);

    class DataDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      history: { x: number; y: number }[];
      maxHistory: number;

      constructor() {
        this.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
        this.y = Math.random() * -height;
        this.speed = Math.random() * 2 + 2; // Falling speed
        this.length = Math.random() * 5 + 3; // Trail length in grid units
        this.opacity = Math.random() * 0.5 + 0.2;
        this.history = [];
        this.maxHistory = 20;
      }

      update() {
        this.y += this.speed;

        // Store history for trail
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }

        // Occasional horizontal shift (square connection)
        if (this.y > 0 && Math.random() > 0.98) {
          const shift = (Math.random() > 0.5 ? 1 : -1) * gridSize;
          // Only shift if meaningful
          if (this.x + shift > 0 && this.x + shift < width) {
            // Add a bridge point to make it look like a rigid turn
            this.history.push({ x: this.x + shift, y: this.y });
            this.x += shift;
          }
        }

        // Reset
        if (this.y > height + 100) {
          this.y = Math.random() * -200;
          this.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
          this.history = [];
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(220, 38, 38, ${this.opacity})`; // Red-600 with opacity
        ctx.lineWidth = 2; // Thinner lines
        ctx.lineJoin = 'round';

        if (this.history.length > 1) {
          ctx.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
        }
        ctx.stroke();

        // Glowing endpoint (Square)
        ctx.fillStyle = '#ef4444'; // Red-500
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(this.x - 2, this.y - 2, 5, 5); // Little square head
        ctx.shadowBlur = 0;
      }
    }

    const drops: DataDrop[] = [];
    const maxDrops = Math.floor(width / gridSize) * 2; // Density

    for (let i = 0; i < maxDrops; i++) {
      drops.push(new DataDrop());
    }

    let frameId: number;
    const animate = () => {
      // Clear with trail for motion blur effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw faint static grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
        drop.update();
        drop.draw(ctx);
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-[#050505]" />;
}
