'use client';

import { ChatContainer } from '@/app/dashboard/projects/[id]/features/chat/container';
import { MarkdownSectionsContainer } from '@/app/dashboard/projects/[id]/features/markdown-sections/container';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function Project() {
    const { status } = useSession();
    const toastShownRef = useRef(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loginSuccess = searchParams.get('loginSuccess');

        if (status === 'authenticated' && loginSuccess === 'true' && !toastShownRef.current) {
            toast.success('Successfully signed in!', { duration: 3000 });
            toastShownRef.current = true;

            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete('loginSuccess');
            const newUrl = `${pathname}?${newSearchParams.toString()}`;
            router.replace(newUrl, { scroll: false });

        } else if (status === 'unauthenticated') {
            toastShownRef.current = false;
        }
    }, [status, searchParams, router, pathname]);

    return (
        <div className="flex flex-col h-full bg-background mr-3">
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="grid grid-cols-12 h-full gap-6 p-8 bg-gradient-to-b from-background to-background/80">
                    {/* Left side container - Chat Panel (30%) */}
                    <div className="col-span-4 h-full rounded-xl overflow-hidden bg-white border border-gray-300 shadow-sm dark:bg-card/90 dark:border-primary/50 dark:glass-effect">
                        <ChatContainer />
                    </div>

                    {/* Right side container - holds both TOC and content in a flex layout */}
                    <div className="col-span-8 h-full rounded-xl overflow-hidden bg-white border border-gray-300 shadow-sm dark:bg-card/90 dark:border-primary/50 dark:glass-effect relative">
                        <MarkdownSectionsContainer />
                    </div>
                </div>
            </main>
        </div>
    );
}