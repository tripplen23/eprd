'use client';
import React from 'react';
import { AuthView } from './components/auth-view';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function Auth() {
    const router = useRouter();
    const handleGoHome = () => router.push('/');

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white dark:bg-black">
            {/* Dark mode gradients */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-transparent to-purple-600/40 opacity-70" />
            <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/30 via-transparent to-transparent opacity-60" />
            <div className="hidden dark:block absolute inset-0 transform rotate-[-30deg] scale-150 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 opacity-50 blur-3xl" />
            {/* Light mode subtle gradient */}
            <div className="block dark:hidden absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 opacity-20" />
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="https://avatars.githubusercontent.com/u/198960902?s=48&v=4"
                            alt="Company Logo"
                            width={48}
                            height={48}
                        />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Rubberduck AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Your PRD AI companion</p>
                </div>
                <AuthView />
                {/* Back to Home button */}
                <div className="flex justify-center mt-6">
                    <Button
                        onClick={handleGoHome}
                        className="relative group px-6 py-2 font-medium text-gray-800 dark:text-white bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden shadow transition-all duration-300 hover:shadow-lg"
                    >
                        {/* Gradient hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000 " />
                        <span className="relative z-10 cursor-pointer">Back to Home</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Auth;
