'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import AdminGridBackground from '../theme/AdminGridBackground';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('adminAuth', 'true');
                router.push('/admin/dashboard');
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch {
            setError('Connection error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white selection:bg-red-500/30">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <AdminGridBackground />
            </div>

            {/* Intense Animated Gradient Orbs - "Tagdi Animation" */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">


                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 0.7, 0.4],
                        rotate: [0, 90, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-red-600/30 rounded-full blur-[100px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, 100, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-800/20 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] mix-blend-overlay"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Main Card - "Karak" Design */}
                <div className="relative bg-[#050505]/90 border border-red-500/20 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.2)] backdrop-blur-xl overflow-hidden group">

                    {/* Glowing Top Border */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_rgba(220,38,38,0.8)]"></div>

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-600 rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-600 rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-600 rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-600 rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <div className="p-8 md:p-12 relative overflow-hidden">

                        {/* Scanline Effect Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.03),rgba(255,0,0,0.06))] bg-size-[100%_4px,3px_100%] pointer-events-none opacity-20"></div>

                        {/* Header Section */}
                        <div className="text-center mb-10 relative z-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block mb-6 relative group"
                            >
                                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <Image
                                    src="/IMG_2839.PNG"
                                    alt="Admin Logo"
                                    width={112}
                                    height={112}
                                    className="h-28 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]"
                                />
                            </motion.div>

                            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                ADMIN PANEL
                            </h1>
                            <div className="flex items-center justify-center gap-3">
                                <span className="h-px w-8 bg-red-600/50"></span>
                                <p className="text-red-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                                    ADMINISTRATION GATEWAY
                                </p>
                                <span className="h-px w-8 bg-red-600/50"></span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-red-500 transition-colors">
                                    Operator ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ENTER_ID"
                                        className="w-full h-14 bg-black/80 border border-white/10 rounded-lg pl-10 pr-4 text-white font-mono placeholder-gray-800 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all shadow-inner hover:border-white/20 uppercase tracking-wider"
                                        required
                                        disabled={loading}
                                    />
                                    {/* Tech Lines */}
                                    <div className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-white/20 rounded-br group-focus-within:border-red-500"></div>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-red-500 transition-colors">
                                    Security Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full h-14 bg-black/80 border border-white/10 rounded-lg pl-10 pr-12 text-white font-mono placeholder-gray-800 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all shadow-inner hover:border-white/20 tracking-widest"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                    <div className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-white/20 rounded-br group-focus-within:border-red-500"></div>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 bg-red-950/40 border-l-4 border-red-600 rounded-r"
                                >
                                    <p className="text-[10px] text-red-500 font-mono font-bold tracking-wider">
                                        [ERROR] :: {error}
                                    </p>
                                </motion.div>
                            )}

                            <div className="pt-4" style={{ marginTop: '30px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full h-16 bg-red-600 hover:bg-red-700 text-black font-black text-xl rounded-lg tracking-[0.25em] transition-all overflow-hidden group shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] active:scale-[0.98]"
                                >
                                    {/* Button Glare Effect */}
                                    <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <div className="h-5 w-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">INITIALIZING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>INITIATE</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer Info */}
                        <div className="mt-10 text-center relative z-10">
                            <p className="text-[9px] text-gray-700 font-mono">
                                SECURE CONNECTION ESTABLISHED<br />
                                <span className="opacity-50">ENCRYPTION: AES-256-GCM // NODE: ALPHA-1</span>
                            </p>

                            <button
                                onClick={() => router.push('/login')}
                                className="mt-6 text-[10px] font-bold text-gray-600 hover:text-red-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-red-500"
                            >
                                [ Return to User Terminal ]
                            </button>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Corner Tech Decorations */}
            <div className="fixed top-10 left-10 w-20 h-20 border-l border-t border-white/5 opacity-50"></div>
            <div className="fixed bottom-10 right-10 w-20 h-20 border-r border-b border-white/5 opacity-50"></div>
        </div>
    );
}

