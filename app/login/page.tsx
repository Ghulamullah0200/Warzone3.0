'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
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
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
});

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: values.email,
                    password: values.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                if (user.status === 'NOT_APPROVED') {
                    router.push('/not-approved');
                } else {
                    localStorage.setItem('user', JSON.stringify(user));
                    router.push('/dashboard');
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
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

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Card with enhanced styling */}
                <div className="relative bg-[#09090b] border border-white/10 rounded-2xl px-8 py-10 md:px-12 md:py-14 shadow-2xl backdrop-blur-xl overflow-hidden">

                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-50"></div>

                    {/* Header with logo */}
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
                            WELCOME BACK
                        </h1>
                        <p className="text-gray-500 font-mono text-xs tracking-[0.2em] uppercase">
                            AUTHENTICATE YOUR SESSION
                        </p>
                    </div>

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

                    <div className="px-0" style={{ padding: "20px" }}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* Email Field */}
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
                                                        className="h-14 pl-4 pr-12 bg-black border-white/10 text-white placeholder:text-gray-700 rounded-lg focus:border-(--accent) focus:ring-0 focus:ring-offset-0 text-sm font-mono tracking-wide transition-all shadow-inner hover:border-white/20"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400 font-bold ml-1" />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center justify-between ml-1">
                                                <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Password
                                                </FormLabel>
                                                <a
                                                    href="/forgot-password"
                                                    className="text-[10px] font-bold text-gray-500 hover:text-(--accent) transition-colors uppercase tracking-wider"
                                                >
                                                    Forgot password?
                                                </a>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    {/* Custom Password Input with Eye Icon */}
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
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

                                <div className="pt-6" style={{ marginTop: '20px' }}>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-(--accent) hover:bg-red-600 text-black font-black text-lg rounded-xl tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_40px_rgba(255,0,51,0.5)] transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <span>AUTHENTICATING...</span>
                                            </div>
                                        ) : (
                                            'LOGIN TO ACCOUNT'
                                        )}
                                    </Button>
                                </div>

                            </form>
                        </Form>
                    </div>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#09090b] px-4 text-gray-600">Or continue with</span>
                        </div>
                    </div>

                    {/* Sign up link */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-mono tracking-wide">
                            NEW USER?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/signup')}
                                className="text-white font-bold hover:text-(--accent) transition-colors border-b border-(--accent) pb-0.5 hover:border-white ml-2"
                            >
                                CREATE ACCOUNT
                            </button>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <LoginForm />
        </Suspense>
    );
}
