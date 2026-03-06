'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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

// Import the background component
import GridBackground from '../theme/GridBackgroundstub';

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
});

function ForgotPasswordForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit() {
        setLoading(true);
        setError('');
        setSuccess(false);

        // Simulation of API call
        try {
            // In a real app, this would call /api/forgot-password
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For now, we simulate success to show the UI state
            setSuccess(true);
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
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

            {/* Card */}
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
                    <div className="mb-10 text-center">
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
                            RESET ACCESS
                        </h1>
                        <p className="text-gray-500 font-mono text-xs tracking-[0.2em] uppercase">
                            RECOVER YOUR IDENTITY
                        </p>
                    </div>

                    {/* Content */}
                    {!success ? (
                        <>
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

                            <div className="px-0" style={{ padding: "0 10px" }}>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
                                                        Registered Email
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

                                        <div className="pt-4" style={{ marginTop: '20px' }}>
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full h-14 bg-(--accent) hover:bg-red-600 text-black font-black text-lg rounded-xl tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_40px_rgba(255,0,51,0.5)] transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                        <span>TRANSMITTING...</span>
                                                    </div>
                                                ) : (
                                                    'SEND RESET LINK'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-900/10 border border-green-500/20 rounded-xl p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2 tracking-wide">LINK TRANSMITTED</h3>
                            <p className="text-gray-400 text-xs font-mono mb-6">
                                If an account exists with this email, you will receive reset instructions shortly.
                            </p>
                            <Button
                                onClick={() => router.push('/login')}
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 text-white font-mono text-xs tracking-wider"
                            >
                                RETURN TO LOGIN
                            </Button>
                        </motion.div>
                    )}

                    {/* Back Link */}
                    {!success && (
                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-xs text-gray-500 font-bold hover:text-(--accent) transition-colors uppercase tracking-widest"
                            >
                                <span className="mr-2">«</span> Back to Login
                            </button>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}

export default function ForgotPassword() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
