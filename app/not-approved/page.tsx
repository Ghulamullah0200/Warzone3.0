'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NotApproved() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Intense red background pulse */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-(--accent)"
            />

            {/* Background grid */}
            <div className="absolute inset-0 bg-grid opacity-30"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="border-4 border-(--accent) p-8 md:p-12 rounded-lg bg-black/90 shadow-[0_0_50px_rgba(255,0,51,0.5)]">
                    {/* Warning icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="text-center mb-6"
                    >
                        <div className="inline-block text-(--accent) text-8xl">⚠</div>
                    </motion.div>

                    {/* Main message */}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl text-center mb-6 font-black text-(--accent) text-glow"
                    >
                        ACCESS DENIED
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4 mb-8"
                    >
                        <p className="terminal-text text-center text-xl md:text-2xl">
                            {'>'} ACCOUNT NOT YET APPROVED
                        </p>
                        <p className="text-center text-(--text-dim) text-sm md:text-base">
                            Your account is currently pending administrative approval.
                            <br />
                            Please wait for verification to complete.
                        </p>
                    </motion.div>

                    {/* Status box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-6 border-2 border-(--accent) bg-(--accent)/10 rounded-lg mb-8"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="terminal-text text-sm">STATUS:</span>
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-(--accent) font-bold"
                            >
                                PENDING APPROVAL
                            </motion.span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="terminal-text text-sm">CLEARANCE LEVEL:</span>
                            <span className="text-(--text-dim)">NONE</span>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 border border-(--border) rounded bg-(--bg-secondary) mb-6"
                    >
                        <p className="text-xs text-(--text-dim) text-center">
                            Contact system administrator for approval status
                            <br />
                            Approval typically processed within 24-48 hours
                        </p>
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button
                            onClick={() => router.push('/login')}
                            className="neon-button flex-1 py-3"
                        >
                            RETURN TO LOGIN
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="border-2 border-(--text-dim) text-(--text-dim) hover:border-(--accent) hover:text-(--accent) px-6 py-3 rounded transition-all flex-1"
                        >
                            RETRY ACCESS
                        </button>
                    </motion.div>

                    {/* Animated warning text */}
                    <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center text-xs text-(--accent) mt-6"
                    >
                        UNAUTHORIZED ACCESS ATTEMPT LOGGED
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
