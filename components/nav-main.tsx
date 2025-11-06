'use client';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, ChevronRight } from 'lucide-react';

interface NavMainProps {
    isCollapsed: boolean;
}

export function NavMain({ isCollapsed }: NavMainProps) {
    const [openItem, setOpenItem] = useState<string | null>(null);
    const router = useRouter();

    const items = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
        },
        {
            title: 'Documents',
            icon: FileText,
            href: '/documents',
            subitems: [
                { title: 'All Documents', href: '/dashboard/projects/[id]' },
                { title: 'Shared', href: '/dashboard/projects/[id]' },
                { title: 'Archived', href: '/dashboard/projects/[id]' },
            ],
        },
    ];

    const NavItem = ({
        item,
        isChild = false,
        onClick,
    }: {
        item: (typeof items)[0] | { title: string; href: string };
        isChild?: boolean;
        onClick?: () => void;
    }) => {
        const Icon = 'icon' in item ? item.icon : null;
        const hasSubitems = 'subitems' in item && item.subitems;

        const content = (
            <div
                role="button"
                onClick={onClick}
                className={cn(
                    'relative group overflow-hidden flex items-center w-full px-3 py-2 rounded-md cursor-pointer transition-all duration-300 ease-in-out hover:text-primary',
                    isCollapsed && !isChild && 'justify-center',
                    isChild && 'pl-8'
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000" />
                {Icon && <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2 relative z-10')} />}
                {(!isCollapsed || isChild) && <span className="relative z-10">{item.title}</span>}
                {hasSubitems && !isCollapsed && (
                    <ChevronRight
                        className={cn(
                            'ml-auto h-4 w-4 relative z-10 transition-transform',
                            openItem === item.title && 'rotate-90'
                        )}
                    />
                )}
            </div>
        );

        return content;
    };

    return (
        <div className="flex flex-col gap-1 px-2">
            {items.map((item) => {
                if (item.subitems && !isCollapsed) {
                    return (
                        <Collapsible
                            key={item.title}
                            open={openItem === item.title}
                            onOpenChange={() => setOpenItem(openItem === item.title ? null : item.title)}
                        >
                            <div className="w-full">
                                <NavItem
                                    item={item}
                                    onClick={() => setOpenItem(openItem === item.title ? null : item.title)}
                                />
                            </div>
                            <CollapsibleContent className="flex flex-col gap-1">
                                {item.subitems.map((subitem) => (
                                    <NavItem
                                        key={subitem.title}
                                        item={subitem}
                                        isChild
                                        onClick={() => router.push(subitem.href)}
                                    />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    );
                }

                return (
                    <div key={item.title}>
                        <NavItem item={item} onClick={() => router.push(item.href)} />
                    </div>
                );
            })}
        </div>
    );
}
