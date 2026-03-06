'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import GridBackground from '../theme/GridBackgroundstub';

export default function AccessProtocol() {
    const [trxId, setTrxId] = useState('');
    const [amount, setAmount] = useState('2000'); // Fixed fee originally, now fetches
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data.settings && data.settings.signupAmount) {
                    setAmount(data.settings.signupAmount.toString());
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const walletAddress = 'TP98WPQ8abeK9cjh1VQzjzvR6xCzsZHAYn';

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/submit-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trxId, amount: parseFloat(amount) }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store TRX ID in localStorage for signup
                localStorage.setItem('pendingTrxId', trxId);

                // Show success toast
                toast.success('Payment submitted successfully!', {
                    description: 'Please complete your account registration.',
                });

                // Redirect to signup after a short delay
                setTimeout(() => {
                    router.push('/signup');
                }, 1000);
            } else {
                setError(data.error || 'Payment submission failed');
            }
        } catch {
            setError('Connection error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Gradient Orbs Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Grid Background */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <GridBackground />
                </div>

                {/* Red Orb 1 */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"
                />

                {/* Red Orb 2 */}
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
                />
            </div>



            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-5xl"
            >
                <div className="relative w-full bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl min-h-[500px] flex flex-col">
                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-50"></div>

                    <div className="p-6 md:p-10 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="text-center mb-6 flex-none">
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-lg"
                            >
                                ACCESS PROTOCOL
                            </motion.h1>
                            <p className="text-gray-500 font-mono text-[10px] tracking-[0.3em] uppercase">Secure Payment Gateway v2.0 // Encrypted Stream</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-1">
                            {/* Left Column: Instructions & Context (Stretches to fill) */}
                            <div className="flex flex-col h-[400px] space-y-6">
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-3">
                                        <div className="w-2 h-2 bg-(--accent) rounded-full animate-pulse"></div>
                                        INSTRUCTIONS
                                    </h3>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex-1 flex flex-col justify-center transition-colors hover:bg-white/[0.07]">
                                        <ul className="space-y-4 text-xs md:text-sm text-gray-400">
                                            <li className="flex gap-4 items-start">
                                                <span className="text-(--accent) font-mono font-bold text-lg">01.</span>
                                                <span className="leading-relaxed pt-1">Click the <strong>QR CODE</strong> button below.</span>
                                            </li>
                                            <li className="flex gap-4 items-start">
                                                <span className="text-(--accent) font-mono font-bold text-lg">02.</span>
                                                <span className="leading-relaxed pt-1">Scan the Code using your <strong>Binance App</strong> or wallet.</span>
                                            </li>
                                            <li className="flex gap-4 items-start">
                                                <span className="text-(--accent) font-mono font-bold text-lg">03.</span>
                                                <span className="leading-relaxed pt-1">Complete transfer and copy the <strong>Transaction Hash (TXID)</strong>.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-(--accent) text-white font-bold tracking-widest transition-all rounded-xl flex items-center justify-center gap-3 group flex-none"
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">📱</span>
                                    SHOW PAYMENT QR CODE
                                </button>
                            </div>

                            {/* Right Column: Interactive Form (Centered) */}
                            <div className="flex flex-col justify-center space-y-8 lg:border-l lg:border-white/5 lg:pl-16">
                                {/* Wallet Address Display */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 block tracking-wider uppercase">Merchant Wallet (TRC20)</label>
                                    <div className="flex bg-black border border-white/10 rounded-lg overflow-hidden group hover:border-(--accent)/50 transition-colors shadow-inner h-12">
                                        <input
                                            value={walletAddress}
                                            readOnly
                                            className="bg-transparent text-xs font-mono text-gray-300 p-3 flex-1 outline-none tracking-widest"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="bg-white/5 hover:bg-(--accent) hover:text-black text-gray-400 text-[10px] font-bold px-4 border-l border-white/10 transition-all uppercase tracking-wider h-full"
                                        >
                                            {copied ? 'COPIED!' : 'COPY'}
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-white/5"></div>

                                {/* Verification Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 block tracking-wider uppercase">Verification Amount</label>
                                        <div className="relative">
                                            <input
                                                value={amount}
                                                readOnly
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono font-bold text-base h-12 cursor-not-allowed"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-(--accent)/20 text-(--accent) px-2 py-0.5 rounded border border-(--accent)/30">
                                                USDT
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 block tracking-wider uppercase">Transaction Hash (TXID)</label>
                                        <input
                                            value={trxId}
                                            onChange={(e) => setTrxId(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-(--accent) transition-all outline-none font-mono text-xs placeholder-gray-700 shadow-inner h-12"
                                            placeholder="Paste full transaction hash here..."
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-2 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-[10px] font-bold text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-(--accent) hover:bg-red-600 text-black font-black py-4 rounded-xl tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_40px_rgba(255,0,51,0.5)] transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 text-lg"
                                    >
                                        {loading ? 'VERIFYING...' : 'VERIFY PAYMENT'}
                                    </button>

                                    <div className="text-center pt-4" style={{ paddingTop: "10px" }}>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-mono tracking-wider">
                                            ALREADY AUTHORIZED?{' '}
                                            <button
                                                type="button"
                                                onClick={() => router.push('/login')}
                                                className="text-white font-bold hover:text-(--accent) transition-colors border-b border-(--accent) pb-0.5 hover:border-white"
                                            >
                                                ENTER SYSTEM
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* QR Code Modal Popup */}
            <AnimatePresence>
                {showQRModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQRModal(false)}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-9999 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-lg w-full"
                        >
                            <div className="border border-(--accent) rounded-xl p-8 bg-black shadow-[0_0_100px_rgba(255,0,51,0.3)] relative overflow-hidden">
                                {/* Animated background grid */}
                                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>

                                {/* Close button */}
                                <div className="absolute top-4 right-4 z-20">
                                    <button
                                        onClick={() => setShowQRModal(false)}
                                        className="w-10 h-10 bg-transparent hover:bg-(--accent) border border-gray-800 hover:border-(--accent) rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl md:text-3xl font-black text-center mb-2 text-glow text-white tracking-tight"
                                >
                                    BINANCE PAY
                                </motion.h2>
                                <p className="text-center text-(--accent) text-xs font-mono tracking-[0.3em] mb-8">SECURE TRANSFER GATEWAY</p>

                                {/* QR Code Image */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="relative w-full aspect-square mb-8 border-4 border-white/10 rounded-xl overflow-hidden bg-white p-2 group"
                                >
                                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-(--accent) z-10"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-(--accent) z-10"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-(--accent) z-10"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-(--accent) z-10"></div>

                                    <div className="relative w-full h-full bg-white rounded-lg overflow-hidden">
                                        <Image
                                            src="/qr.jpeg"
                                            alt="Binance Pay QR Code"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>

                                    {/* Scan line animation */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-(--accent)/50 shadow-[0_0_20px_var(--accent)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                </motion.div>

                                {/* Instructions */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="inline-block px-4 py-1 border border-(--accent)/30 rounded-full bg-(--accent)/5">
                                        <p className="terminal-text text-xs font-bold text-(--accent) tracking-wider">
                                            SCAN WITH BINANCE APP
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">
                                        Open App <span className="text-(--accent)">→</span> Scan QR <span className="text-(--accent)">→</span> Pay
                                    </p>
                                    <div className="pt-4 mt-4 border-t border-gray-900">
                                        <button
                                            onClick={() => setShowQRModal(false)}
                                            className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                                        >
                                            [ Close Window ]
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
