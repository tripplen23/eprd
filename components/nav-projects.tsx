'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder, Forward, MoreHorizontal, Trash2 } from 'lucide-react';

interface NavProjectsProps {
    isCollapsed: boolean;
}

export function NavProjects({ isCollapsed }: NavProjectsProps) {
    const projects = [
        {
            title: 'Design Engineering',
            href: '/projects/design',
        },
        {
            title: 'Sales & Marketing',
            href: '/projects/sales',
        },
        {
            title: 'Travel',
            href: '/projects/travel',
        },
    ];

    return (
        <div className="px-2">
            <div className="flex items-center justify-between px-2 py-2">
                {!isCollapsed && <span className="text-sm text-primary font-medium">Projects</span>}
            </div>

            <div className="flex flex-col gap-1">
                {projects.map((project) => {
                    const content = (
                        <div className="group flex items-center">
                            <Button
                                variant="ghost"
                                asChild
                                className={cn(
                                    'flex-1 justify-start hover:bg-accent/50',
                                    isCollapsed && 'justify-center px-0'
                                )}
                            >
                                <a href={project.href} className="flex items-center">
                                    <Folder className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                                    {!isCollapsed && <span>{project.title}</span>}
                                </a>
                            </Button>

                            {!isCollapsed && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal className="cursor-pointer h-4 w-4" />
                                            <span className="sr-only">More</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>
                                            <Folder className="mr-2 h-4 w-4" />
                                            View Project
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Forward className="mr-2 h-4 w-4" />
                                            Share Project
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    );

                    return <div key={project.title}>{content}</div>;
                })}
            </div>
        </div>
    );
}