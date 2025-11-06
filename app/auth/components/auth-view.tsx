'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import LoadingDots from '@/components/ui/loading-dots';
import { toast } from 'sonner';

// Define provider types for type safety
type AuthProvider = 'microsoft-entra-id' | 'google' | 'linkedin';

export function AuthView({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
    const [error, setError] = useState('');
    const callbackUrl = '/dashboard/projects/[id]?loginSuccess=true';

    const handleLoginWithProvider = async (provider: AuthProvider) => {
        setLoadingProvider(provider);
        setError('');
        try {
            await signIn(provider, { callbackUrl });
        } catch (error) {
            console.error(`Sign in with ${provider} failed:`, error);
            const errorMessage = 'An error occurred during sign in. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            setLoadingProvider(null);
        }
    };


    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="relative border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-xl-light bg-white dark:bg-gradient-to-b from-black/80 to-gray-900/90 rounded-xl overflow-hidden">
                {/* Dark mode gradient stripe */}
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-600/10 opacity-50"></div>
                {/* Light mode subtle pattern */}
                <div className="block dark:hidden absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-indigo-50 opacity-30"></div>
                {/* Top accent stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                <CardHeader className="space-y-2 relative z-10">
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-secondary">
                        Authentication
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600 dark:text-gray-100 text-sm font-light">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-6 relative z-10">
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <Button
                            className="w-full h-12 font-medium text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 transition-all duration-300 rounded-lg shadow relative group overflow-hidden"
                            onClick={() => handleLoginWithProvider('microsoft-entra-id')}
                            disabled={loadingProvider !== null}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-transparent to-yellow-300/30 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
                            <span className="flex items-center justify-center gap-3 relative z-10">
                                <img src="/providers/Microsoft_Logo.svg" alt="Microsoft Logo" className="h-5 w-5" />
                                {loadingProvider === 'microsoft-entra-id' ? <LoadingDots /> : 'Continue with Microsoft'}
                            </span>
                        </Button>

                        <Button
                            className="w-full h-12 font-medium text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 transition-all duration-300 rounded-lg shadow relative group overflow-hidden"
                            onClick={() => handleLoginWithProvider('google')}
                            disabled={loadingProvider !== null}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-transparent to-red-500/30 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
                            <span className="flex items-center justify-center gap-3 relative z-10">
                                <img src="/providers/Google_Logo.svg" alt="Google Logo" className="h-5 w-5" />
                                {loadingProvider === 'google' ? <LoadingDots /> : 'Continue with Google'}
                            </span>
                        </Button>

                        <Button
                            className="w-full h-12 font-medium text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 transition-all duration-300 rounded-lg shadow relative group overflow-hidden"
                            onClick={() => handleLoginWithProvider('linkedin')}
                            disabled={loadingProvider !== null}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-transparent to-blue-400/30 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
                            <span className="flex items-center justify-center gap-3 relative z-10">
                                <img src="/providers/LinkedIn_Logo.svg" alt="LinkedIn Logo" className="h-5 w-5" />
                                {loadingProvider === 'linkedin' ? <LoadingDots /> : 'Continue with LinkedIn'}
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
