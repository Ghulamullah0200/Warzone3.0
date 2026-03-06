'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { User } from '../../types';
import { DashboardContext } from './DashboardContext';
import GridBackground from '../theme/GridBackgroundstub';
import { NotificationToast } from '../components/NotificationToast';


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [showDeposit, setShowDeposit] = useState(false);

    // Deposit Form State
    const [amount, setAmount] = useState('');
    const [trxId, setTrxId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copied, setCopied] = useState(false);
    const [minDeposit, setMinDeposit] = useState(7000);

    // Notification State
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; id?: number } | null>(null);


    const router = useRouter();
    const pathname = usePathname();
    const walletAddress = 'TP98WPQ8abeK9cjh1VQzjzvR6xCzsZHAYn';

    const fetchUser = useCallback(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const parsed = JSON.parse(storedUser);
        fetch(`/api/users/${parsed.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(prev => ({ ...prev, ...data.user }));
                    localStorage.setItem('user', JSON.stringify({ ...parsed, ...data.user }));
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data.settings && data.settings.minDepositAmount) {
                    setMinDeposit(data.settings.minDepositAmount);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();

        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.status !== 'APPROVED') {
            router.push('/not-approved');
            return;
        }

        setUser(parsedUser);
        fetchUser(); // Fetch fresh data
    }, [router, fetchUser]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setSuccess('');

        // Validate minimum deposit amount
        const depositAmount = parseFloat(amount);
        if (depositAmount < minDeposit) {
            setError(`Minimum deposit amount is $${minDeposit} USDT`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    trxId,
                    amount: depositAmount
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Deposit submitted successfully! Waiting for approval.');
                setTrxId('');
                setAmount('');
                setTimeout(() => {
                    setShowDeposit(false);
                    setSuccess('');
                }, 3000);
            } else {
                setError(data.error || 'Deposit failed');
            }
        } catch {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const isActive = (path: string) => pathname === path;

    // Context Methods
    const openDepositModal = () => setShowDeposit(true);
    const closeDepositModal = () => setShowDeposit(false);
    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 3500);
    };


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="cyber-spinner"></div>
            </div>
        );
    }

    return (
        <DashboardContext.Provider value={{
            openDepositModal,
            closeDepositModal,
            showNotification,
            userBalance: user.balance || 0,
            refreshUser: fetchUser
        }}>
            <div className="min-h-screen relative bg-[#050505]">
                {/* Animated Gradient Orbs Background */}
                {/* Animated Gradient Orbs Background & Grid */}
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

                {/* Content wrapper with relative positioning */}
                <div className="relative z-10">
                    {/* ── Premium Notification Toast ── */}
                    <NotificationToast
                        notification={notification}
                        onClose={() => setNotification(null)}
                        duration={3500}
                    />

                    {/* Header */}
                    <motion.header
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        className="border-b border-(--border) bg-black/90 backdrop-blur-md sticky top-0 z-50 shadow-lg"
                    >
                        <div className="container mx-auto px-4 py-4" style={{ padding: '16px 24px' }}>
                            <div className="flex items-center justify-between">
                                {/* Logo */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center cursor-pointer"
                                    onClick={() => router.push('/dashboard')}
                                >
                                    <div className="relative w-48 h-12 md:w-56 md:h-14">
                                        <Image
                                            src="/logo_header.PNG"
                                            alt="WARZONE"
                                            fill
                                            className="object-contain"
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                </motion.div>

                                {/* User info & Actions */}
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block text-right mr-2">
                                        <p className="text-sm terminal-text font-bold text-white mb-1">USER: <span className="text-gray-300">{user.username}</span></p>
                                        <div className="flex flex-col items-end">
                                            <p className="text-xs text-(--accent) font-bold tracking-wider mb-0.5">
                                                WALLET: <span className="text-white text-glow ml-1">${(user.balance || 0).toFixed(2)}</span>
                                            </p>
                                            {user.accountExpiresAt && (
                                                <p className="text-[10px] text-gray-500 font-mono">
                                                    EXPIRES: {new Date(user.accountExpiresAt).toLocaleDateString()}
                                                    <span className="text-(--accent) ml-1">
                                                        ({Math.ceil((new Date(user.accountExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} DAYS)
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowDeposit(true)}
                                        className="neon-button text-xs! px-6! py-2.5! rounded-none transition-all hover:bg-(--accent) hover:text-white font-bold tracking-widest"
                                    >
                                        DEPOSIT
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="neon-button text-xs! px-6! py-2.5! rounded-none transition-all border-red-600 text-red-500 hover:bg-red-600 hover:text-white shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] font-bold tracking-widest"
                                        style={{ '--accent': '#dc2626' } as React.CSSProperties}
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.header>

                    {/* Navigation */}
                    <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="border-b border-(--border) bg-(--bg-secondary)"
                    >
                        <div className="container mx-auto px-4">
                            <div className="flex justify-center gap-24 md:gap-48 py-5 overflow-x-auto">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className={`relative px-12 md:px-16 py-3 mx-4 text-sm font-black tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group ${isActive('/dashboard')
                                        ? 'bg-(--accent) text-black border-(--accent) shadow-[0_0_25px_var(--accent)] scale-110 z-10'
                                        : 'bg-black/60 text-gray-500 border-gray-800 hover:border-(--accent) hover:text-white! hover:shadow-[0_0_15px_var(--accent)] hover:bg-black'
                                        }`}
                                >
                                    <span className="block skew-x-15 group-hover:scale-105 transition-transform relative z-10">MARKETPLACE</span>
                                    {isActive('/dashboard') && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/orders')}
                                    className={`relative px-12 md:px-16 py-3 mx-4 text-sm font-black tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group ${isActive('/dashboard/orders')
                                        ? 'bg-(--accent) text-black border-(--accent) shadow-[0_0_25px_var(--accent)] scale-110 z-10'
                                        : 'bg-black/60 text-gray-500 border-gray-800 hover:border-(--accent) hover:text-white! hover:shadow-[0_0_15px_var(--accent)] hover:bg-black'
                                        }`}
                                >
                                    <span className="block skew-x-15 group-hover:scale-105 transition-transform relative z-10">MY ORDERS</span>
                                    {isActive('/dashboard/orders') && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/offers')}
                                    className={`relative px-12 md:px-16 py-3 mx-4 text-sm font-black tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group ${isActive('/dashboard/offers')
                                        ? 'bg-(--accent) text-black border-(--accent) shadow-[0_0_25px_var(--accent)] scale-110 z-10'
                                        : 'bg-black/60 text-gray-500 border-gray-800 hover:border-(--accent) hover:text-white! hover:shadow-[0_0_15px_var(--accent)] hover:bg-black'
                                        }`}
                                >
                                    <span className="block skew-x-15 group-hover:scale-105 transition-transform relative z-10">OFFERS</span>
                                    {isActive('/dashboard/offers') && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </button>
                            </div>
                        </div>
                    </motion.nav>

                    {/* Main content */}
                    <main className="container mx-auto px-4 py-8 md:py-12" style={{ padding: '40px 24px' }}>
                        {children}
                    </main>

                    {/* Footer */}
                    <footer className="border-t border-(--border) mt-20 bg-black/80 backdrop-blur-sm">
                        <div className="container mx-auto px-4 py-8" style={{ padding: '32px 24px' }}>
                            <p className="text-center text-xs text-gray-500 font-mono tracking-widest">
                                WARZONE PROTOCOL <span className="text-(--accent)">v2.0</span> {/* ENCRYPTED CONNECTION */}
                            </p>
                        </div>
                    </footer>

                    {/* Deposit Modal - Pop Up Centered */}
                    <AnimatePresence>
                        {showDeposit && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowDeposit(false)}
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-9999 grid place-items-center p-4 overflow-y-auto"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#0a0a0a] border border-(--accent) p-8 max-w-lg w-full rounded-lg shadow-[0_0_50px_rgba(255,0,51,0.2)] relative"
                                >
                                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none rounded-lg"></div>
                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <h2 className="text-2xl font-black text-white glitch" data-text="DEPOSIT FUNDS">DEPOSIT FUNDS</h2>
                                        <button
                                            onClick={() => setShowDeposit(false)}
                                            className="text-gray-500 hover:text-white text-xl p-2 transition-colors hover:rotate-90 duration-300"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        {/* Address Section */}
                                        <div className="p-4 bg-black/50 border border-gray-800 rounded group hover:border-(--accent)/50 transition-colors">
                                            <p className="text-xs text-(--accent) font-bold mb-2 tracking-wide">USDT (TRC20) DEPOSIT ADDRESS:</p>
                                            <div className="flex gap-2">
                                                <code className="flex-1 bg-black p-3 rounded text-xs text-white break-all font-mono border border-gray-800 group-hover:border-(--accent)/30 transition-colors">
                                                    {walletAddress}
                                                </code>
                                                <button
                                                    onClick={handleCopy}
                                                    className="px-4 py-1 bg-(--accent) text-black text-xs font-black rounded hover:bg-white transition-colors uppercase tracking-wider shadow-[0_0_10px_rgba(255,0,51,0.3)]"
                                                >
                                                    {copied ? 'COPIED!' : 'COPY'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* QR Code Placeholder */}
                                        <div className="flex justify-center my-6">
                                            <div className="w-56 h-56 relative border-2 border-(--accent) rounded-lg bg-white p-2 shadow-[0_0_30px_rgba(255,0,51,0.2)] group hover:scale-105 transition-transform duration-300">
                                                <div className="absolute -inset-1 bg-linear-to-r from-(--accent) to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                                <div className="relative w-full h-full bg-white rounded-md overflow-hidden">
                                                    <Image
                                                        src="/qr.jpeg"
                                                        alt="Deposit QR Code"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form */}
                                        <form onSubmit={handleDeposit} className="space-y-5">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1 font-bold tracking-wide">AMOUNT (USDT)</label>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder={`Minimum: $${minDeposit}`}
                                                    className="w-full bg-black border border-gray-800 p-3 text-white focus:border-(--accent) focus:shadow-[0_0_15px_rgba(255,0,51,0.1)] focus:outline-none transition-all rounded font-mono font-bold"
                                                    required
                                                    min={minDeposit}
                                                    step="0.01"
                                                />
                                                <p className="text-[10px] text-gray-500 mt-2 font-mono tracking-wide">
                                                    ⚠ MINIMUM DEPOSIT: ${minDeposit} USDT
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1 font-bold tracking-wide">TRANSACTION ID (TRX ID)</label>
                                                <input
                                                    type="text"
                                                    value={trxId}
                                                    onChange={(e) => setTrxId(e.target.value)}
                                                    placeholder="Enter transaction hash"
                                                    className="w-full bg-black border border-gray-800 p-3 text-white focus:border-(--accent) focus:shadow-[0_0_15px_rgba(255,0,51,0.1)] focus:outline-none transition-all rounded font-mono"
                                                    required
                                                />
                                            </div>

                                            {error && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-500 text-xs mt-2 p-3 border border-red-500/20 bg-red-500/10 rounded font-bold text-center"
                                                >
                                                    ⚠ ERROR: {error}
                                                </motion.p>
                                            )}
                                            {success && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-green-500 text-xs mt-2 p-3 border border-green-500/20 bg-green-500/10 rounded font-bold text-center"
                                                >
                                                    ✓ {success}
                                                </motion.p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-(--accent) text-black font-black tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-4 rounded shadow-[0_0_20px_rgba(255,0,51,0.3)] uppercase text-sm"
                                            >
                                                {loading ? 'VERIFYING...' : 'CONFIRM DEPOSIT'}
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}

