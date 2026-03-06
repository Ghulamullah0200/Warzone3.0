'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X, AlertTriangle, Shield } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type NotifType = 'success' | 'error' | 'info';

export interface NotifState {
    message: string;
    type: NotifType;
    id?: number; // used to reset animation on repeated triggers
}

// ─────────────────────────────────────────────────────────────────────────────
// Config per type
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
    success: {
        label: 'OPERATION SUCCESS',
        Icon: CheckCircle2,
        accent: '#22c55e',
        border: 'border-green-500/60',
        shadow: '0 0 40px rgba(34,197,94,0.25)',
        iconBg: 'bg-green-500/10 border-green-500/40',
        iconColor: 'text-green-400',
        bar: 'bg-green-500',
        labelColor: 'text-green-400',
        glow: 'rgba(34,197,94,0.15)',
    },
    error: {
        label: 'SYSTEM ERROR',
        Icon: XCircle,
        accent: '#ff0033',
        border: 'border-red-500/60',
        shadow: '0 0 40px rgba(255,0,51,0.3)',
        iconBg: 'bg-red-500/10 border-red-500/40',
        iconColor: 'text-red-400',
        bar: 'bg-gradient-to-r from-red-600 to-red-400',
        labelColor: 'text-red-400',
        glow: 'rgba(255,0,51,0.15)',
    },
    info: {
        label: 'NOTIFICATION',
        Icon: Info,
        accent: '#3b82f6',
        border: 'border-blue-500/60',
        shadow: '0 0 40px rgba(59,130,246,0.25)',
        iconBg: 'bg-blue-500/10 border-blue-500/40',
        iconColor: 'text-blue-400',
        bar: 'bg-blue-500',
        labelColor: 'text-blue-400',
        glow: 'rgba(59,130,246,0.15)',
    },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// NotificationToast Component
// ─────────────────────────────────────────────────────────────────────────────
interface ToastProps {
    notification: NotifState | null;
    onClose: () => void;
    duration?: number; // ms, default 3000
}

export function NotificationToast({ notification, onClose, duration = 3000 }: ToastProps) {
    const cfg = notification ? CONFIG[notification.type] : null;

    return (
        <AnimatePresence mode="wait">
            {notification && cfg && (
                <motion.div
                    key={notification.id ?? notification.message}
                    initial={{ opacity: 0, y: -24, x: '-50%', scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                    exit={{ opacity: 0, y: -16, x: '-50%', scale: 0.95 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    style={{ boxShadow: cfg.shadow }}
                    className={`
                        fixed top-6 left-1/2 z-[99999]
                        w-[90vw] max-w-[420px]
                        bg-[#070707]/95 backdrop-blur-xl
                        border ${cfg.border}
                        rounded-xl overflow-hidden
                        flex flex-col
                    `}
                >
                    {/* ── Accent top line ── */}
                    <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />

                    {/* ── Scanner sweep line ── */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                        className="absolute top-0 left-0 w-16 h-full pointer-events-none"
                        style={{ background: `linear-gradient(90deg, transparent, ${cfg.glow}, transparent)` }}
                    />

                    {/* ── Body ── */}
                    <div className="flex items-start gap-4 px-5 py-4 relative">
                        {/* Icon */}
                        <div className={`
                            mt-0.5 w-9 h-9 rounded-lg flex-shrink-0
                            flex items-center justify-center
                            border ${cfg.iconBg}
                        `}>
                            <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-[9px] font-black tracking-[0.25em] uppercase mb-0.5 ${cfg.labelColor}`}>
                                {cfg.label}
                            </p>
                            <p className="text-sm font-semibold text-white leading-snug break-words">
                                {notification.message}
                            </p>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* ── Progress drain bar ── */}
                    <motion.div
                        key={`bar-${notification.id ?? notification.message}`}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                        className={`h-[3px] w-full ${cfg.bar} opacity-80`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmDialog — replaces window.confirm()
// ─────────────────────────────────────────────────────────────────────────────
export interface ConfirmState {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

interface ConfirmDialogProps {
    state: ConfirmState | null;
    onClose: () => void;
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
    if (!state) return null;

    const type = state.type ?? 'danger';
    const isCrit = type === 'danger';

    const ICON_MAP = { danger: XCircle, warning: AlertTriangle, info: Shield };
    const Icon = ICON_MAP[type];

    const colors = {
        danger: { accent: '#ff0033', border: 'border-red-500/50', icon: 'text-red-400', bg: 'bg-red-500/10', btn: 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(255,0,51,0.4)]' },
        warning: { accent: '#f59e0b', border: 'border-yellow-500/50', icon: 'text-yellow-400', bg: 'bg-yellow-500/10', btn: 'bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
        info: { accent: '#3b82f6', border: 'border-blue-500/50', icon: 'text-blue-400', bg: 'bg-blue-500/10', btn: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' },
    }[type];

    return (
        <AnimatePresence>
            {state && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.88, y: 24, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 12, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                        onClick={e => e.stopPropagation()}
                        style={{ boxShadow: `0 0 60px ${colors.accent}22` }}
                        className={`
                            relative w-full max-w-md
                            bg-[#080808] border ${colors.border}
                            rounded-2xl overflow-hidden
                        `}
                    >
                        {/* Top accent line */}
                        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` }} />

                        {/* Glow orb bg */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
                            style={{ background: colors.accent }} />

                        <div className="relative p-8">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6`}>
                                <Icon className={`w-7 h-7 ${colors.icon}`} />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-black text-white tracking-wide mb-2">{state.title}</h3>
                            <p className="text-sm text-gray-400 font-mono leading-relaxed mb-8">{state.message}</p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl font-black text-xs tracking-widest transition-all"
                                >
                                    {state.cancelLabel ?? 'CANCEL'}
                                </button>
                                <button
                                    onClick={() => { state.onConfirm(); onClose(); }}
                                    className={`flex-1 py-3 text-white font-black text-xs tracking-widest rounded-xl transition-all ${colors.btn}`}
                                >
                                    {state.confirmLabel ?? (isCrit ? 'DELETE' : 'CONFIRM')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
