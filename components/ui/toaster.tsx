'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-[#09090b] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl',
                    description: 'group-[.toast]:text-gray-400',
                    actionButton:
                        'group-[.toast]:bg-[var(--accent)] group-[.toast]:text-black',
                    cancelButton:
                        'group-[.toast]:bg-white/10 group-[.toast]:text-white',
                    success: 'group-[.toast]:border-green-500/20 group-[.toast]:bg-green-900/10',
                    error: 'group-[.toast]:border-red-500/20 group-[.toast]:bg-red-900/10',
                    warning: 'group-[.toast]:border-yellow-500/20 group-[.toast]:bg-yellow-900/10',
                    info: 'group-[.toast]:border-blue-500/20 group-[.toast]:bg-blue-900/10',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
