'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../components/ui/form';

import GridBackground from '../theme/GridBackgroundstub';

const formSchema = z.object({
    username: z.string().min(3, {
        message: 'Username must be at least 3 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
});

function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [trxId, setTrxId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const pendingTrxId = localStorage.getItem('pendingTrxId');
        if (!pendingTrxId) {
            router.push('/access-protocol');
            return;
        }
        setTrxId(pendingTrxId);
    }, [router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!trxId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    trxId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('pendingTrxId');

                // Show success toast
                toast.success('Congratulations! Account created successfully.', {
                    description: 'We will notify you via email when your account is approved.',
                    duration: 5000,
                });

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Connection error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    }

    if (!trxId) {
        return (
            <div className="min-h-screen items-center justify-center bg-black flex">
                <div className="w-10 h-10 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Background */}
            <GridBackground />

            {/* Animated gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

            {/* Signup Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="relative bg-[#09090b] border border-white/10 rounded-2xl px-8 py-10 md:px-12 md:py-14 shadow-2xl backdrop-blur-xl overflow-hidden">

                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-50"></div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center mb-6"
                        >
                            <Image
                                src="/IMG_2839.PNG"
                                alt="Logo"
                                width={96}
                                height={96}
                                className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                            />
                        </motion.div>

                        <h1 className="text-3xl font-black text-white tracking-tighter mb-2 drop-shadow-md">
                            CREATE ACCOUNT
                        </h1>
                        <p className="text-gray-500 font-mono text-xs tracking-[0.2em] uppercase">
                            BEGIN YOUR OPERATIONS
                        </p>
                    </div>

                    {/* Payment Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 p-3 bg-yellow-900/10 border border-yellow-500/20 rounded-lg flex items-center justify-between gap-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_5px_#eab308]"></div>
                            <span className="text-[10px] font-bold text-yellow-500 tracking-widest uppercase">Payment Pending Approval</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 truncate max-w-[120px]">
                            {trxId}
                        </span>
                    </motion.div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-bold text-center tracking-wide"
                        >
                            ⚠ {error}
                        </motion.div>
                    )}

                    <div className="px-0" style={{ padding: "10px" }}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                {/* Username */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
                                                Codename (Username)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        placeholder="Create your identity"
                                                        className="h-14 pl-4 bg-black border-white/10 text-white placeholder:text-gray-700 rounded-lg focus:border-(--accent) focus:ring-0 focus:ring-offset-0 text-sm font-mono tracking-wide transition-all shadow-inner hover:border-white/20"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400 font-bold ml-1" />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
                                                Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        placeholder="name@example.com"
                                                        type="email"
                                                        className="h-14 pl-4 bg-black border-white/10 text-white placeholder:text-gray-700 rounded-lg focus:border-(--accent) focus:ring-0 focus:ring-offset-0 text-sm font-mono tracking-wide transition-all shadow-inner hover:border-white/20"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400 font-bold ml-1" />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a strong password"
                                                            className="h-14 pl-4 pr-12 bg-black border-white/10 text-white placeholder:text-gray-700 rounded-lg focus:border-(--accent) focus:ring-0 focus:ring-offset-0 text-sm font-mono tracking-wide transition-all shadow-inner hover:border-white/20 w-full"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="w-5 h-5" />
                                                            ) : (
                                                                <Eye className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400 font-bold ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4" style={{ marginTop: '20px' }}>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-(--accent) hover:bg-red-600 text-black font-black text-lg rounded-xl tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_40px_rgba(255,0,51,0.5)] transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <span>INITIALIZING...</span>
                                            </div>
                                        ) : (
                                            'ACTIVATE ACCOUNT'
                                        )}
                                    </Button>
                                </div>

                            </form>
                        </Form>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#09090b] px-4 text-gray-600">Consider joining?</span>
                        </div>
                    </div>

                    {/* Login link */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-mono tracking-wide">
                            RETURNING AGENT?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-white font-bold hover:text-(--accent) transition-colors border-b border-(--accent) pb-0.5 hover:border-white ml-2"
                            >
                                ACCESS TERMINAL
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function Signup() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignupForm />
        </Suspense>
    );
}
