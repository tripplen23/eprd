'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { useMobile } from '@/hooks/use-mobile';
import { useState, memo } from 'react';
import { Pin, PinOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

function AppSidebarComponent({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLockedOpen, setIsLockedOpen] = useState(false);
    const isMobile = useMobile();
    const router = useRouter();

    const handleLogoClick = () => {
        router.push('/dashboard/projects/[id]');
    };

    const toggleLock = () => {
        const newLockedState = !isLockedOpen;
        setIsLockedOpen(newLockedState);
        setIsCollapsed(!newLockedState);
    };

    const handleMouseEnter = () => {
        if (!isLockedOpen) {
            setIsCollapsed(false);
        }
    };

    const handleMouseLeave = () => {
        if (!isLockedOpen) {
            setIsCollapsed(true);
        }
    };

    const MainContent = () => (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    'flex h-[60px] items-center px-3',
                    isCollapsed ? 'justify-center' : 'justify-between',
                    'pointer-events-auto'
                )}
            >
                <div className={cn('flex items-center gap-2 flex-1', isCollapsed && 'hidden')}>
                    {!isCollapsed && (
                        <button
                            className="cursor-pointer flex items-center justify-between w-full px-2 py-1 rounded-md hover:bg-primary/15 active:bg-primary/25 transition-all duration-75"
                            onClick={handleLogoClick}
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src="https://avatars.githubusercontent.com/u/198960902?s=48&v=4"
                                    alt="Company Logo"
                                    className="h-6 w-6"
                                />
                                <div className="flex flex-col text-left leading-tight">
                                    <span className="text-base font-semibold">PRD Chat</span>
                                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer p-1.5 rounded-md hover:bg-primary/15 active:bg-primary/25 text-white hover:text-primary/90 active:scale-95 transition-all duration-75"
                        onClick={toggleLock}
                    >
                        {isLockedOpen ? (
                            <Pin className="w-5 h-5 text-black dark:text-white" />
                        ) : (
                            <PinOff className="w-5 h-5 text-black dark:text-white" />
                        )}
                    </Button>
                )}
            </div>

            <Separator />

            <div className={cn('flex-1 overflow-auto py-4', !isCollapsed && 'pointer-events-auto')}>
                <NavMain isCollapsed={isCollapsed} />
                <Separator className="my-4" />
                <NavProjects isCollapsed={isCollapsed} />
            </div>

            <div className="mt-auto">
                <Separator />
                <div className={cn('px-2 py-2', !isCollapsed && 'pointer-events-auto')}>
                    <NavUser isCollapsed={isCollapsed} />
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet>
                <SheetContent side="left" className="w-[200px] p-0">
                    <MainContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'flex flex-col border-r bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out h-full dark:border-primary/50',
                isCollapsed ? 'w-[55px]' : 'w-[200px]',
                className
            )}
        >
            <div className="pointer-events-auto h-full">
                <MainContent />
            </div>
        </aside>
    );
}

export const AppSidebar = memo(AppSidebarComponent);