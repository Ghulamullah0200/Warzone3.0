'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Layers, Server, ShieldCheck, Database, Zap, Loader2, PackageX, AlertTriangle, CheckCircle, X, CreditCard, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDashboard } from '../DashboardContext';
import type { Offer, OfferOrder, OfferOrderCard } from '../../../types';

// Page-specific extension for normalization
interface NormalizedOffer extends Offer {
    cards: number;
}

const TIER_STYLES = [
    { color: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Tag },
    { color: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-500', icon: Layers },
    { color: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Server },
    { color: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Database },
    { color: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-500', icon: ShieldCheck },
    { color: 'border-[--accent]/50', bg: 'bg-[--accent]/10', text: 'text-[--accent]', icon: Zap },
];

export default function OffersPage() {
    const [offers, setOffers] = useState<NormalizedOffer[]>([]);
    const [availableCards, setAvailableCards] = useState(0);
    const [avgCardPrice, setAvgCardPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Track which offers this user has already purchased (to hide them)
    const [purchasedOfferIds, setPurchasedOfferIds] = useState<Set<string>>(new Set());

    // Confirm popup state
    const [confirmOffer, setConfirmOffer] = useState<NormalizedOffer | null>(null);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');

    // Receipt modal state
    const [receipt, setReceipt] = useState<OfferOrder | null>(null);
    const [receiptExpanded, setReceiptExpanded] = useState<number | null>(0);
    const [receiptVisible, setReceiptVisible] = useState<number | null>(null);

    const [viewType, setViewType] = useState<'CARD' | 'PROXY'>('CARD');

    const { showNotification, refreshUser } = useDashboard();

    useEffect(() => {
        // Fetch offers
        fetch('/api/offers')
            .then(res => res.json())
            .then(data => {
                const raw: Offer[] = data.offers || [];
                setAvailableCards(data.availableCards ?? 0);
                setAvgCardPrice(data.avgCardPrice ?? 0);
                const normalized: NormalizedOffer[] = raw.map(o => ({ ...o, cards: o.cardCount }));
                setOffers(normalized);
            })
            .catch(() => setError('Failed to load offers'))
            .finally(() => setLoading(false));

        // Pre-fetch this user's purchased offer IDs to hide them from the list
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);
            fetch(`/api/offer-orders/${u.id}?page=1&limit=100`)
                .then(r => r.json())
                .then(data => {
                    const ordersList = data.offerOrders || data.orders || [];
                    const ids = new Set<string>(
                        ordersList.map((o: { offerId?: string }) => o.offerId).filter(Boolean)
                    );
                    setPurchasedOfferIds(ids);
                })
                .catch(() => { });
        }
    }, []);

    const handleConfirmPurchase = async () => {
        if (!confirmOffer) return;
        setPurchasing(true);
        setPurchaseError('');

        const userData = localStorage.getItem('user');
        if (!userData) { setPurchaseError('Not logged in'); setPurchasing(false); return; }
        const user = JSON.parse(userData);

        try {
            const res = await fetch('/api/purchase-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    offerId: confirmOffer._id,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Update local balance
                const updatedUser = { ...user, balance: data.newBalance };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                refreshUser();

                // Remove this offer from the list immediately
                const purchasedId = data.offerId || confirmOffer._id;
                setPurchasedOfferIds(prev => new Set([...prev, purchasedId]));

                setConfirmOffer(null);
                showNotification(`Offer "${confirmOffer.title}" purchased! ${data.offerOrder?.cardCount || confirmOffer.cards} cards unlocked.`, 'success');

                // Show receipt
                if (data.offerOrder) {
                    setReceiptExpanded(0);
                    setReceiptVisible(null);
                    setReceipt(data.offerOrder);
                }
            } else {
                setPurchaseError(data.error || 'Purchase failed');
            }
        } catch {
            setPurchaseError('Connection error. Try again.');
        } finally {
            setPurchasing(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[--accent] animate-spin" />
                    <p className="text-gray-500 font-mono text-sm tracking-widest">FETCHING MARKET DATA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative p-8 rounded-2xl border border-(--border) bg-[#0a0a0a]/80 backdrop-blur">
                <div className="absolute top-0 right-0 w-64 h-64 bg-(--accent)/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="z-10">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2">
                        BULK <span className="text-(--accent) text-glow">ASSETS</span>
                    </h1>
                    <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
                        High volume card packages — real prices, real discounts
                    </p>
                </div>
                <div className="z-10 flex flex-col sm:flex-row gap-4">
                    <div className="px-6 py-3 bg-black border border-gray-800 rounded flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300 tracking-widest">
                            {availableCards} CARDS IN MARKET
                        </span>
                    </div>
                    <div className="px-6 py-3 bg-black border border-(--accent)/30 rounded flex items-center gap-3">
                        <span className="text-xs font-bold text-(--accent) tracking-widest">
                            AVG ${avgCardPrice.toFixed(2)} / CARD
                        </span>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 p-1 bg-[#0a0a0a] border border-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setViewType('CARD')}
                    className={`px-8 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${viewType === 'CARD' ? 'bg-(--accent) text-black shadow-[0_0_20px_rgba(255,0,51,0.2)]' : 'text-gray-500 hover:text-white'}`}
                >
                    CARD BUNDLES
                </button>
                <button
                    onClick={() => setViewType('PROXY')}
                    className={`px-8 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${viewType === 'PROXY' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'text-gray-500 hover:text-white'}`}
                >
                    PROXY PACKAGES
                </button>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-6 bg-red-900/10 border border-red-500/30 rounded-xl text-center text-red-400 font-mono text-sm">
                    ⚠ {error}
                </div>
            )}

            {/* ── No Offers State ── */}
            {!error && offers.filter(o => !purchasedOfferIds.has(o._id) && (o.type || 'CARD') === viewType).length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative flex flex-col items-center justify-center py-24 px-8 rounded-2xl border border-dashed border-gray-800 bg-[#080808] overflow-hidden"
                >
                    {/* Background glow orb */}
                    <div className="absolute w-72 h-72 rounded-full blur-[120px] opacity-10 pointer-events-none"
                        style={{ background: viewType === 'CARD' ? 'var(--accent)' : '#2563eb' }} />

                    {/* Animated outer ring */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center bg-[#0d0d0d]">
                                {viewType === 'CARD' ? <PackageX className="w-7 h-7 text-gray-600" /> : <Server className="w-7 h-7 text-gray-600" />}
                            </div>
                        </div>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-full border border-gray-700/40 animate-ping opacity-30" />
                    </div>

                    {/* Text */}
                    <h3 className="text-2xl font-black text-gray-500 tracking-[0.15em] uppercase mb-3">
                        NO {viewType === 'CARD' ? 'BUNDLES' : 'PROXIES'} AVAILABLE
                    </h3>
                    <p className="text-gray-700 font-mono text-sm text-center max-w-sm leading-relaxed mb-6">
                        No {viewType === 'CARD' ? 'card bundle' : 'proxy package'} offers have been published yet.<br />Check back later — exclusive deals drop regularly.
                    </p>
                </motion.div>
            )}


            {/* Offers Grid — hide purchased offers and filter by viewType */}
            {offers.filter(o => !purchasedOfferIds.has(o._id) && (o.type || 'CARD') === viewType).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.filter(o => !purchasedOfferIds.has(o._id) && (o.type || 'CARD') === viewType).map((offer, index) => {
                        const styleIdx = offer.styleIndex ?? index;
                        const style = TIER_STYLES[styleIdx % TIER_STYLES.length];
                        const IconComponent = style.icon;
                        const savings = offer.originalPrice - offer.price;
                        return (
                            <motion.div
                                key={offer._id || offer.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative bg-[#0f0f0f] border ${style.color} p-1 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300`}
                            >
                                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

                                <div className="h-full bg-[#050505] rounded-lg p-6 flex flex-col relative overflow-hidden">
                                    <div className={`absolute -right-10 -top-10 w-32 h-32 ${style.bg} blur-3xl rounded-full group-hover:scale-150 transition-transform duration-500`}></div>

                                    {/* Top Row */}
                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-lg bg-[#111] border border-gray-800 ${style.text}`}>
                                            {offer.type === 'PROXY' ? <Server className="w-8 h-8" /> : <IconComponent className="w-8 h-8" />}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase ${style.bg} ${style.text} border ${style.color}`}>
                                                {offer.discount}% OFF
                                            </span>
                                            {offer.badge && (
                                                <span className="px-2 py-0.5 rounded bg-yellow-900/20 border border-yellow-700/40 text-yellow-400 text-[9px] font-black tracking-wider uppercase">
                                                    {offer.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-black text-white italic tracking-wide mb-1 group-hover:text-(--accent) transition-colors relative z-10">
                                        {offer.title}
                                    </h3>
                                    <p className={`text-xs font-black tracking-widest mb-3 relative z-10 ${style.text}`}>
                                        {offer.type === 'PROXY' ? `${offer.cards} HIGH-SPEED PROXIES` : `${offer.cards} CARDS BUNDLE`}
                                    </p>

                                    <p className="text-sm text-gray-500 font-mono mb-4 grow relative z-10">
                                        {offer.type === 'PROXY' ? `${offer.proxyType} · ${offer.state || 'WORLDWIDE'} · PRIVATE ASSETS` : offer.description}
                                    </p>

                                    {/* Savings badge */}
                                    <div className="relative z-10 mb-4 px-3 py-2 bg-green-900/10 border border-green-800/30 rounded flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                        <span className="text-xs text-green-400 font-mono font-bold">
                                            YOU SAVE ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Price Footer */}
                                    <div className="mt-auto pt-6 border-t border-gray-900 relative z-10">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <span className="text-xs text-gray-600 line-through font-mono block mb-1">
                                                    ${offer.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-2xl font-black text-white tracking-tight">
                                                    ${offer.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2 font-mono">USDT</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-500 block uppercase tracking-widest font-bold font-mono">
                                                    {offer.type === 'PROXY' ? 'PER PROXY' : 'PER CARD'}
                                                </span>
                                                <span className={`text-sm font-mono font-black ${style.text}`}>
                                                    ${offer.type === 'PROXY' ? (offer.price / offer.cards).toFixed(2) : offer.avgPricePerCard.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => { setConfirmOffer(offer); setPurchaseError(''); }}
                                            className={`w-full py-3 ${style.bg} border ${style.color} ${style.text} font-black text-xs tracking-[0.2em] rounded hover:bg-white hover:text-black hover:border-white transition-all uppercase`}
                                        >
                                            {offer.type === 'PROXY' ? 'PURCHASE PROXY PACK' : 'PURCHASE BUNDLE'}
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Confirm Purchase Popup ── */}
            <AnimatePresence>
                {confirmOffer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-9999 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => { if (!purchasing) setConfirmOffer(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 40 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-[#0a0a0a] border border-(--accent) rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(255,0,51,0.25)] overflow-hidden"
                        >
                            {/* Background grid */}
                            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none rounded-2xl"></div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-(--accent)/10 blur-[80px] rounded-full pointer-events-none"></div>

                            {/* Close btn */}
                            {!purchasing && (
                                <button
                                    onClick={() => setConfirmOffer(null)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            <div className="relative z-10">
                                {/* Warning icon */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-(--accent)/10 border border-(--accent)/30 rounded-xl">
                                        <AlertTriangle className="w-7 h-7 text-(--accent)" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-wide">CONFIRM PURCHASE</h2>
                                        <p className="text-xs text-gray-500 font-mono tracking-widest">TRANSACTION REQUIRES APPROVAL</p>
                                    </div>
                                </div>

                                {/* Bundle details */}
                                <div className="bg-black/60 border border-gray-800 rounded-xl p-5 mb-6 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">{confirmOffer.type === 'PROXY' ? 'Package' : 'Bundle'}</span>
                                        <span className="text-sm font-black text-white">{confirmOffer.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">{confirmOffer.type === 'PROXY' ? 'Proxies' : 'Cards'}</span>
                                        <span className="text-sm font-bold text-white">{confirmOffer.cards} units</span>
                                    </div>
                                    {confirmOffer.type === 'PROXY' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Type / State</span>
                                            <span className="text-sm font-bold text-blue-400">{confirmOffer.proxyType} · {confirmOffer.state || 'Global'}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Discount</span>
                                        <span className="text-sm font-bold text-green-400">{confirmOffer.discount}% OFF</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Original</span>
                                        <span className="text-sm font-mono text-gray-500 line-through">
                                            ${confirmOffer.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                                        <span className="text-xs text-gray-400 font-black tracking-widest uppercase">Total Due</span>
                                        <span className="text-2xl font-black text-(--accent)">
                                            ${confirmOffer.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            <span className="text-xs text-gray-500 ml-1 font-mono">USDT</span>
                                        </span>
                                    </div>
                                </div>

                                {purchaseError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 p-3 bg-red-900/20 border border-red-500/40 rounded-lg flex items-start gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-xs font-mono">{purchaseError}</p>
                                    </motion.div>
                                )}

                                <p className="text-xs text-gray-600 font-mono mb-6 text-center">
                                    ⚠ This will deduct <span className="text-white font-bold">${confirmOffer.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span> from your wallet.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmOffer(null)}
                                        disabled={purchasing}
                                        className="flex-1 py-3 bg-transparent border border-gray-800 text-gray-400 font-black text-xs tracking-widest rounded-lg hover:border-gray-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleConfirmPurchase}
                                        disabled={purchasing}
                                        className="flex-1 py-3 bg-(--accent) text-black font-black text-xs tracking-widest rounded-lg hover:bg-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {purchasing ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING...</>
                                        ) : (
                                            <><CheckCircle className="w-4 h-4" /> CONFIRM</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Receipt Modal ── */}
            <AnimatePresence>
                {receipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setReceipt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 40 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-[#0a0a0a] border border-(--accent) rounded-2xl max-w-2xl w-full shadow-[0_0_60px_rgba(255,0,51,0.25)] overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none rounded-2xl" />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-(--accent)/10 blur-[80px] rounded-full pointer-events-none" />

                            {/* Header */}
                            <div className="relative z-10 p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white tracking-wide">PURCHASE RECEIPT</h2>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {receipt.offerType === 'PROXY' ? `${receipt.cardCount} PROXIES` : `${receipt.cardCount} CARDS`} UNLOCKED · ${receipt.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setReceipt(null)} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cards list or Proxy Link */}
                            <div className="relative z-10 overflow-y-auto flex-1 p-6 space-y-4">
                                {receipt.offerType === 'PROXY' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-8 flex flex-col items-center text-center gap-6"
                                    >
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                            <Server className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Proxies Secured</h3>
                                            <p className="text-sm text-gray-400 font-mono max-w-xs mx-auto">
                                                Your {receipt.cardCount} high-speed {receipt.proxyType || 'SOCKS5'} proxies are ready for deployment.
                                            </p>
                                        </div>

                                        <div className="w-full h-px bg-white/5 my-2"></div>

                                        <a
                                            href={receipt.proxyFile}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-4 bg-white text-black font-black tracking-[0.2em] uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
                                        >
                                            <Database className="w-5 h-5" />
                                            DOWNLOAD PROXY PDF
                                        </a>

                                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">
                                            Download this file to get your proxy credentials and instructions.
                                        </p>
                                    </motion.div>
                                ) : (
                                    (receipt.cards as OfferOrderCard[]).map((card, idx) => (
                                        <div key={idx} className="bg-black/60 border border-gray-800 rounded-xl overflow-hidden">
                                            {/* Card header — always visible */}
                                            <button
                                                onClick={() => setReceiptExpanded(receiptExpanded === idx ? null : idx)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-(--accent)/10 border border-(--accent)/20 rounded-lg">
                                                        <CreditCard className="w-4 h-4 text-(--accent)" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-black text-white tracking-wide">CARD #{idx + 1}</p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {receiptVisible === idx
                                                                ? card.cardNumber?.replace(/(.{4})/g, '$1 ').trim()
                                                                : `•••• •••• •••• ${card.cardNumber?.slice(-4) || '????'}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setReceiptVisible(receiptVisible === idx ? null : idx); }}
                                                        className="p-1.5 text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {receiptVisible === idx ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    {receiptExpanded === idx ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {receiptExpanded === idx && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-4 pb-4 grid grid-cols-2 gap-2 border-t border-gray-800 pt-3"
                                                    >
                                                        {[
                                                            { label: 'Card Number', value: receiptVisible === idx ? card.cardNumber?.replace(/(.{4})/g, '$1 ').trim() : `•••• •••• •••• ${card.cardNumber?.slice(-4)}` },
                                                            { label: 'CVV', value: receiptVisible === idx ? card.cvv : '•••' },
                                                            { label: 'Expiry', value: card.expiry },
                                                            { label: 'Holder', value: card.holder },
                                                            { label: 'Bank', value: card.bank },
                                                            { label: 'Type', value: card.type },
                                                            { label: 'Address', value: card.address },
                                                            { label: 'City', value: card.city },
                                                            { label: 'State', value: card.state },
                                                            { label: 'ZIP', value: card.zip },
                                                            { label: 'Country', value: card.country },
                                                            { label: 'Email', value: card.email },
                                                            { label: 'Phone', value: card.phone },
                                                            { label: 'Password', value: receiptVisible === idx ? card.password : '••••••••' },
                                                            { label: 'SSN', value: receiptVisible === idx ? card.ssn : '•••-••-••••' },
                                                            { label: 'DOB', value: card.dob },
                                                        ].filter(f => f.value).map(({ label, value }) => (
                                                            <div key={label} className="bg-white/5 rounded-lg p-2">
                                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{label}</p>
                                                                <p className="text-xs text-white font-mono break-all">{value}</p>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                )}
                            </div>


                            {/* Footer */}
                            <div className="relative z-10 p-4 border-t border-gray-800 shrink-0">
                                <button
                                    onClick={() => setReceipt(null)}
                                    className="w-full py-3 bg-(--accent) text-black font-black text-xs tracking-widest rounded-lg hover:bg-white transition-all"
                                >
                                    CLOSE RECEIPT
                                </button>
                                <p className="text-center text-[10px] text-gray-600 font-mono mt-2">View full history in My Orders → Bundles</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
