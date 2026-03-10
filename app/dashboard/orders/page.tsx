'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, User, BundleOrder, OfferOrder, ProxyOrder } from '../../../types';
import { Package, CheckCircle, Percent, Gift, Server, Database, Globe } from 'lucide-react';

interface Payment {
    _id: string;
    trxId: string;
    amount: number;
    type: 'SIGNUP' | 'DEPOSIT';
    status: 'PENDING' | 'APPROVED';
    createdAt: string;
}

export default function Orders() {
    const [activeTab, setActiveTab] = useState<'purchases' | 'proxies' | 'bundles' | 'deposits'>('purchases');
    const [orders, setOrders] = useState<Order[]>([]);
    const [proxyOrders, setProxyOrders] = useState<ProxyOrder[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [bundleOrders, setBundleOrders] = useState<BundleOrder[]>([]);
    const [offerOrders, setOfferOrders] = useState<OfferOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [purchasesPage, setPurchasesPage] = useState(1);
    const [proxiesPage, setProxiesPage] = useState(1);
    const [depositsPage, setDepositsPage] = useState(1);
    const [bundlesPage, setBundlesPage] = useState(1);
    const [totalPurchasesPages, setTotalPurchasesPages] = useState(1);
    const [totalProxiesPages, setTotalProxiesPages] = useState(1);
    const [totalDepositsPages, setTotalDepositsPages] = useState(1);
    const [totalBundlesPages, setTotalBundlesPages] = useState(1);
    const [totalPurchases, setTotalPurchases] = useState(0);
    const [totalProxies, setTotalProxies] = useState(0);
    const itemsPerPage = 9;

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchOrders(parsedUser.id, purchasesPage);
            fetchProxyOrders(parsedUser.id, proxiesPage);
            fetchPayments(parsedUser.id, depositsPage);
            fetchBundleOrders(parsedUser.id, bundlesPage);
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { if (user) fetchOrders(user.id, purchasesPage); }, [purchasesPage, user]);
    useEffect(() => { if (user) fetchProxyOrders(user.id, proxiesPage); }, [proxiesPage, user]);
    useEffect(() => { if (user) fetchPayments(user.id, depositsPage); }, [depositsPage, user]);
    useEffect(() => { if (user) fetchBundleOrders(user.id, bundlesPage); }, [bundlesPage, user]);

    useEffect(() => {
        if (user) {
            fetchOfferOrders(user.id);
        }
    }, [user]);

    const fetchProxyOrders = async (userId: string, page: number) => {
        try {
            const res = await fetch(`/api/proxy-orders/${userId}?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            setProxyOrders(data.orders || []);
            if (data.pagination) {
                setTotalProxiesPages(data.pagination.pages);
                setTotalProxies(data.pagination.total);
            }
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async (userId: string, page: number) => {
        try {
            const res = await fetch(`/api/orders/${userId}?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            setOrders(data.orders || []);
            if (data.pagination) {
                setTotalPurchasesPages(data.pagination.pages);
                setTotalPurchases(data.pagination.total);
            }
        } catch (e) { console.error(e); }
    };

    const fetchPayments = async (userId: string, page: number) => {
        try {
            const res = await fetch(`/api/payments/${userId}?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            setPayments(data.payments || []);
            if (data.pagination) setTotalDepositsPages(data.pagination.pages);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchBundleOrders = async (userId: string, page: number) => {
        try {
            const res = await fetch(`/api/bundle-orders/${userId}?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            setBundleOrders(data.bundleOrders || []);
            if (data.pagination) setTotalBundlesPages(data.pagination.pages);
        } catch (e) { console.error(e); }
    };

    const fetchOfferOrders = async (userId: string) => {
        try {
            // Offer orders are usually fewer, fetching all or first page is often fine
            const res = await fetch(`/api/offer-orders/${userId}?page=1&limit=50`);
            const data = await res.json();
            // Support both 'offerOrders' and 'orders' key from API
            setOfferOrders(data.offerOrders || data.orders || []);
        } catch (e) { console.error(e); }
    };

    const formatDate = (date: Date | string) =>
        new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const formatCardNumber = (num: string | undefined) => {
        if (!num) return 'XXXX XXXX XXXX XXXX';
        const clean = num.replace(/\s+/g, '');
        const matches = clean.match(/.{1,4}/g);
        return matches ? matches.join(' ') : clean;
    };


    const renderPagination = (current: number, total: number, setter: React.Dispatch<React.SetStateAction<number>>) => total <= 1 ? null : (
        <div className="p-4 flex justify-center gap-2 mt-8">
            <button onClick={() => setter(Math.max(1, current - 1))} disabled={current === 1}
                className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50 hover:text-white text-xs font-bold">PREV</button>
            <div className="flex items-center gap-2">
                {Array.from({ length: total }, (_, i) => i + 1)
                    .slice(Math.max(0, current - 3), Math.min(total, current + 2))
                    .map(n => (
                        <button key={n} onClick={() => setter(n)}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${current === n ? 'bg-(--accent) text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}>{n}</button>
                    ))}
            </div>
            <button onClick={() => setter(Math.min(total, current + 1))} disabled={current === total}
                className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50 hover:text-white text-xs font-bold">NEXT</button>
        </div>
    );


    if (loading && !user) {
        return <div className="flex items-center justify-center min-h-[400px]"><div className="cyber-spinner"></div></div>;
    }

    return (
        <div className="container mx-auto min-w-0">
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black mb-2 text-white tracking-tight">TRANSACTION HISTORY</h2>
                    <p className="text-gray-400 text-sm font-medium">Manage your financial records and asset acquisitions.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg" style={{ padding: '20px' }}>
                        <span className="text-xs text-gray-500 font-bold block">TOTAL SPENT</span>
                        <span className="text-(--accent) font-black text-lg">
                            ${(orders.reduce((s, o) => s + (o.price || 0), 0) + proxyOrders.reduce((s, p) => s + (p.price || 0), 0) + bundleOrders.reduce((s, b) => s + (b.price || 0), 0) + offerOrders.reduce((s, o) => s + (o.price || 0), 0)).toLocaleString()}
                        </span>
                    </div>
                    <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg" style={{ padding: '20px' }}>
                        <span className="text-xs text-gray-500 font-bold block">TOTAL ASSETS</span>
                        <span className="text-white font-black text-lg">{totalPurchases + totalProxies + bundleOrders.length + offerOrders.length}</span>
                    </div>
                    <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg" style={{ padding: '20px' }}>
                        <span className="text-xs text-gray-500 font-bold block">PROXIES SECURED</span>
                        <span className="text-white font-black text-lg">{totalProxies + offerOrders.filter(o => o.offerType === 'PROXY').length}</span>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[#333]">
                {(['purchases', 'proxies', 'bundles', 'deposits'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold tracking-wide transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {tab === 'purchases' ? `CARDS (${totalPurchases})`
                            : tab === 'proxies' ? `PROXIES (${totalProxies + offerOrders.filter(o => o.offerType === 'PROXY').length})`
                                : tab === 'bundles' ? `BUNDLES (${bundleOrders.length + offerOrders.filter(o => o.offerType === 'CARD').length})`
                                    : 'DEPOSITS'}
                        {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent)" />}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ── PURCHASES TAB ── */}
                {activeTab === 'purchases' && (
                    <motion.div key="purchases" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                            {orders.length > 0 ? orders.map((order, index) => (
                                <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col group hover:border-(--accent) transition-all duration-300 h-full">
                                    <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>
                                    <div className="h-1.5 w-full bg-(--accent) shadow-[0_0_15px_rgba(255,0,51,0.4)]"></div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-white font-black italic tracking-wider text-lg leading-tight uppercase">{order.cardTitle}</h3>
                                                    <p className="text-[10px] text-gray-500 font-mono mt-1">ASSET_ID: {order.id.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-(--accent) font-black text-xl leading-none">${order.price}</div>
                                                    <div className="text-[10px] text-gray-600 font-bold uppercase mt-1 tracking-widest">USDT</div>
                                                </div>
                                            </div>

                                            {/* Primary Card Details (Market Style) */}
                                            <div className="relative aspect-[1.6/1] w-full bg-linear-to-br from-[#111] to-black border border-white/10 rounded-xl p-5 overflow-hidden group-hover:border-(--accent)/30 transition-colors">
                                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                                    <h3 className="text-3xl font-black italic tracking-tighter leading-none text-white">{order.type || 'VISA'}</h3>
                                                </div>

                                                <div className="h-10 w-12 bg-yellow-500/80 rounded-md mb-6 opacity-80"></div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Card Number</p>
                                                        <p className="text-xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                                            {formatCardNumber(order.cardNumber)}
                                                        </p>
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Holder Name</p>
                                                            <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">{order.holder || 'XXXX XXXX'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Expires</p>
                                                            <p className="text-xs font-mono font-bold text-white">{order.expiry || 'XX/XX'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-white/5 space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-gray-600 font-mono uppercase">Date: {new Date(order.purchaseDate).toLocaleDateString()}</span>
                                                <span className="text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle size={10} /> ASSET_SECURED
                                                </span>
                                            </div>

                                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Full Details in Receipt Popup Only</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 text-gray-500 col-span-full">
                                    <p className="font-mono tracking-widest">NO PURCHASE HISTORY FOUND</p>
                                </div>
                            )}

                        </div>
                        {renderPagination(purchasesPage, totalPurchasesPages, setPurchasesPage)}
                    </motion.div>
                )}

                {/* ── PROXIES TAB ── */}
                {activeTab === 'proxies' && (
                    <motion.div key="proxies" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                            {/* Standalone proxies */}
                            {proxyOrders.map((pOrder, index) => (
                                <motion.div key={pOrder.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[#0a0a0a] border border-blue-900/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col group hover:border-blue-500 transition-all duration-300 h-full">
                                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                                    <div className="h-1.5 w-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Globe className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{pOrder.country}</span>
                                                    </div>
                                                    <h3 className="text-white font-black italic tracking-wider text-xl leading-tight uppercase">{pOrder.proxyTitle}</h3>
                                                    <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">NODE_ID: {pOrder.id.slice(-8)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-black text-xl leading-none">${pOrder.price}</div>
                                                    <div className="text-[10px] text-gray-600 font-bold uppercase mt-1 tracking-widest">PAID</div>
                                                </div>
                                            </div>

                                            {/* Proxy Credentials Node */}
                                            <div className="bg-black/60 border border-white/5 rounded-xl p-5 space-y-4 group-hover:border-blue-500/20 transition-colors">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[8px] text-gray-600 uppercase font-black mb-1">Entry Node</p>
                                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                                                            <span className="text-xs font-mono font-bold text-white">{pOrder.host}</span>
                                                            <span className="text-xs font-mono font-bold text-blue-500">{pOrder.port}</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[8px] text-gray-600 uppercase font-black mb-1">Username</p>
                                                            <p className="text-xs font-mono font-bold text-gray-300 truncate bg-white/5 p-2 rounded border border-white/5">{pOrder.username_proxy || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] text-gray-600 uppercase font-black mb-1">Password</p>
                                                            <p className="text-xs font-mono font-bold text-blue-500 truncate bg-white/5 p-2 rounded border border-blue-500/20">{pOrder.password_proxy || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {pOrder.pdfUrl ? (
                                                    <a
                                                        href={pOrder.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-3 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-400 font-black text-[10px] tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                                                    >
                                                        <Database className="w-4 h-4" />
                                                        DOWNLOAD DOCUMENTATION
                                                    </a>
                                                ) : (
                                                    <div className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-gray-600 font-black text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                                                        <Database className="w-3.5 h-3.5 opacity-30" />
                                                        NO MANUAL ATTACHED
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-gray-600 font-mono uppercase italic">{pOrder.type} PROTOCOL</span>
                                            <span className="text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                <CheckCircle size={10} /> ENCRYPTED_STABLE
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Proxy Offer orders */}
                            {offerOrders.filter(o => o.offerType === 'PROXY').map((oo, ooIdx) => (
                                <motion.div key={oo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ooIdx * 0.1 }}
                                    className="bg-[#0a0a0a] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.1)] relative flex flex-col group hover:border-blue-500/60 transition-all duration-300 h-full">
                                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                                    <div className="h-1.5 w-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                    <Server className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-black text-xl leading-none">${oo.price}</div>
                                                    <div className="text-[10px] text-gray-600 font-bold uppercase mt-1 tracking-widest">OFFER PAID</div>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-white italic tracking-wide mb-1 uppercase leading-tight">
                                                {oo.offerTitle}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 font-mono mb-6 tracking-widest">
                                                {oo.cardCount} NODES UNLOCKED · {oo.offerCountry}
                                            </p>

                                            <div className="space-y-4 border-t border-gray-900 pt-6">
                                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{oo.proxyType || 'SOCKS5'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[10px] text-green-500 font-black uppercase">Active Nodes</span>
                                                    </div>
                                                </div>

                                                {oo.proxyFile ? (
                                                    <a
                                                        href={oo.proxyFile}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-4 bg-blue-600/20 border border-blue-500/50 text-blue-400 font-black text-[11px] tracking-[0.2em] uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                                                    >
                                                        <Database className="w-4 h-4" />
                                                        DOWNLOAD NODES LIST (PDF)
                                                    </a>
                                                ) : (
                                                    <div className="w-full py-4 bg-white/5 border border-white/10 text-gray-600 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                                                        <Database className="w-4 h-4 opacity-30" />
                                                        SETUP FILES NOT ATTACHED
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-gray-600 font-mono uppercase italic">PURCHASED: {new Date(oo.createdAt || oo.purchaseDate).toLocaleDateString()}</span>
                                            <span className="text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                                <Package size={10} /> BULK_PROVISION
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {proxyOrders.length === 0 && offerOrders.filter(o => o.offerType === 'PROXY').length === 0 && (
                                <div className="text-center py-20 text-gray-500 col-span-full">
                                    <p className="font-mono tracking-widest uppercase">No purchased proxies found</p>
                                    <p className="text-gray-700 text-[10px] mt-2">Any proxies you purchase will appear here for management.</p>
                                </div>
                            )}
                        </div>
                        {renderPagination(proxiesPage, totalProxiesPages, setProxiesPage)}
                    </motion.div>
                )}

                {/* ── BUNDLES TAB ── */}
                {activeTab === 'bundles' && (
                    <motion.div key="bundles" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-8">

                        {/* Legacy bundle orders (from old bundle system) */}
                        {bundleOrders.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bundleOrders.map((bo, index) => (
                                    <motion.div key={bo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                                        className="group bg-[#0a0a0a] border border-gray-800 hover:border-(--accent) transition-all duration-300 rounded-xl overflow-hidden shadow-lg relative">
                                        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                                        <div className="h-1 w-full bg-linear-to-r from-(--accent) to-purple-600 shadow-[0_0_10px_rgba(255,0,51,0.5)]"></div>
                                        <div className="p-6 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-(--accent)/10 border border-(--accent)/20 rounded-lg">
                                                    <Package className="w-5 h-5 text-(--accent)" />
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-900/10 border border-green-800/30 rounded text-[10px] font-black text-green-400">
                                                    <Percent className="w-3 h-3" />
                                                    {bo.discount}% OFF
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-white italic tracking-wide mb-1 group-hover:text-(--accent) transition-colors">
                                                {bo.bundleTitle}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono mb-4">{bo.cardCount} CARDS BUNDLE</p>
                                            <div className="space-y-2 border-t border-gray-900 pt-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600 font-mono">Original Price</span>
                                                    <span className="text-gray-500 line-through font-mono">${bo.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Paid</span>
                                                    <span className="text-white font-black text-base">${bo.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-gray-500 font-mono text-xs">USDT</span></span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600 font-mono">You Saved</span>
                                                    <span className="text-green-400 font-bold font-mono">${(bo.originalPrice - bo.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-xs pt-2 border-t border-gray-900">
                                                    <span className="text-gray-600 font-mono">Purchased</span>
                                                    <span className="text-gray-400 font-mono">{formatDate(bo.purchaseDate)}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 p-2 bg-green-900/5 border border-green-800/20 rounded text-[10px] text-green-500 font-bold">
                                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                                BUNDLE ACTIVATED
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        {renderPagination(bundlesPage, totalBundlesPages, setBundlesPage)}

                        {/* Offer orders — purchased from Offers page (ONLY CARD OFFERS HERE) */}
                        {offerOrders.filter(o => o.offerType === 'CARD').length > 0 && (
                            <div className="flex flex-col gap-4">
                                {bundleOrders.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-800" />
                                        <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase font-mono">Offer Purchases</span>
                                        <div className="h-px flex-1 bg-gray-800" />
                                    </div>
                                )}
                                {offerOrders.filter(o => o.offerType === 'CARD').map((oo, ooIdx) => (
                                    <motion.div key={oo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ooIdx * 0.06 }}
                                        className={`bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-lg relative`}>
                                        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                                        <div className={`h-1.5 w-full bg-linear-to-r from-(--accent) to-yellow-500 shadow-[0_0_10px_rgba(255,0,51,0.4)]`} />

                                        <div className="p-6 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2.5 bg-(--accent)/10 border-(--accent)/20 border rounded-xl`}>
                                                    <Gift className="w-5 h-5 text-(--accent)" />
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-900/10 border border-green-800/30 rounded text-[10px] font-black text-green-400">
                                                    <CheckCircle className="w-3 h-3" />
                                                    PURCHASED
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-white italic tracking-wide mb-1">
                                                    {oo.offerTitle}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-mono mb-4 uppercase tracking-widest">
                                                    {oo.cardCount} CARDS BUNDLE · {new Date(oo.createdAt || oo.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex flex-col gap-3 border-t border-gray-900 pt-4">
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="text-gray-500 font-bold uppercase tracking-wider">Amount Paid</span>
                                                    <span className="text-white font-black text-lg">${oo.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-gray-500 font-mono text-xs">USDT</span></span>
                                                </div>

                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">View in History for Details</p>
                                                </div>

                                                <div className="flex items-center gap-2 p-2 bg-green-900/5 border border-green-800/20 rounded text-[10px] text-green-500 font-bold uppercase tracking-widest">
                                                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                                    Assets Secured
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {bundleOrders.length === 0 && offerOrders.filter(o => o.offerType === 'CARD').length === 0 && (
                            <div className="text-center py-20 text-gray-500 col-span-full">
                                <p className="font-mono tracking-widest uppercase italic">No bundle assets detected</p>
                                <p className="text-gray-700 text-[10px] mt-2 tracking-widest">Explore our exclusive bundle offers to secure high-value assets.</p>
                            </div>
                        )}

                        {/* Empty state — nothing at all */}
                        {bundleOrders.length === 0 && offerOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-800 rounded-xl bg-black/50">
                                <Package className="w-16 h-16 text-gray-700 mb-4" />
                                <p className="text-gray-500 font-mono text-sm tracking-widest">NO BUNDLE PURCHASES YET</p>
                                <p className="text-gray-700 text-xs font-mono mt-2">Visit the Offers page to purchase a bundle</p>
                            </div>
                        )}

                    </motion.div>
                )}


                {/* ── DEPOSITS TAB ── */}
                {activeTab === 'deposits' && (
                    <motion.div key="deposits" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {payments.length > 0 ? payments.map((payment, index) => (
                                <motion.div key={payment._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                                    className="group relative bg-[#0a0a0a] border border-gray-800 hover:border-(--accent) transition-all duration-300 rounded-lg overflow-hidden h-[200px] flex flex-col shadow-lg">
                                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                                    <div className={`h-1 w-full ${payment.type === 'DEPOSIT' ? 'bg-blue-600 shadow-[0_0_10px_#2563eb]' : 'bg-purple-600 shadow-[0_0_10px_#9333ea]'}`}></div>
                                    <div className="p-6 flex flex-col h-full justify-between relative z-10" style={{ padding: '24px' }}>
                                        <div className="flex justify-between items-start">
                                            <div className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${payment.type === 'DEPOSIT' ? 'bg-blue-900/20 text-blue-500 border-blue-500/30' : 'bg-purple-900/20 text-purple-500 border-purple-500/30'}`}>
                                                {payment.type}
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${payment.status === 'APPROVED' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {payment.status === 'APPROVED' ? <span className="animate-pulse">●</span> : '○'} {payment.status}
                                            </div>
                                        </div>
                                        <div className="text-center my-1">
                                            <span className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-(--accent) transition-colors">
                                                ${payment.amount.toLocaleString()}
                                            </span>
                                            <div className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 uppercase">USDT (TRC20)</div>
                                        </div>
                                        <div className="border-t border-dashed border-gray-800 pt-3 mt-auto">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TX HASH</span>
                                                    <span className="text-[10px] font-mono text-gray-300 bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800" title={payment.trxId}>
                                                        {payment.trxId.slice(0, 6)}...{payment.trxId.slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] text-gray-500 font-bold block mb-0.5 tracking-wider">DATE</span>
                                                    <span className="text-[10px] text-gray-300 font-mono">
                                                        {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 text-gray-500 col-span-full"><p>No deposit history found.</p></div>
                            )}
                        </div>
                        {renderPagination(depositsPage, totalDepositsPages, setDepositsPage)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
