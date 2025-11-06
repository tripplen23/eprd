'use client';

import { MarkdownComponents } from '@/app/dashboard/projects/[id]/features/markdown-sections/components/markdown-preview/markdown-components';
import { cn } from '@/lib/utils';
import React, { memo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// Helper function to normalize text for comparison
function normalizeText(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .trim()
        .replace(/[\*_`~#]/g, '')
        .replace(/\s+/g, ' ');
}

// Function to apply highlighting after rendering
function applyDiffHighlighting(oldContainer: HTMLElement | null, newContainer: HTMLElement | null) {
    if (!oldContainer || !newContainer) return;

    // Reset previous highlights
    oldContainer
        .querySelectorAll('.diff-deleted, .diff-added')
        .forEach((el) => el.classList.remove('diff-deleted', 'diff-added'));
    newContainer
        .querySelectorAll('.diff-deleted, .diff-added')
        .forEach((el) => el.classList.remove('diff-deleted', 'diff-added'));

    const elementSelector = 'p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, td, th';
    const oldElements = oldContainer.querySelectorAll(elementSelector);
    const newElements = newContainer.querySelectorAll(elementSelector);

    const oldTextsSet = new Set(Array.from(oldElements).map((el) => normalizeText(el.textContent)));
    const newTextsSet = new Set(Array.from(newElements).map((el) => normalizeText(el.textContent)));

    oldElements.forEach((el) => {
        const normalizedText = normalizeText(el.textContent);
        if (normalizedText.length > 0 && !newTextsSet.has(normalizedText)) {
            el.classList.add('diff-deleted');
        }
    });

    newElements.forEach((el) => {
        const normalizedText = normalizeText(el.textContent);
        if (normalizedText.length > 0 && !oldTextsSet.has(normalizedText)) {
            el.classList.add('diff-added');
        }
    });
}

interface MarkdownPreviewDiffProps {
    className?: string;
    sectionId: string;
    title: string;
    oldContent: string;
    newContent: string;
    onAccept: (sectionId: string) => void;
    onReject: (sectionId: string) => void;
}

const DiffViewer = memo(function DiffViewer({ oldContent, newContent }: { oldContent: string; newContent: string }) {
    const components = MarkdownComponents();
    const oldContainerRef = useRef<HTMLDivElement>(null);
    const newContainerRef = useRef<HTMLDivElement>(null);

    // Process HTML iframes
    const iframeRegex = /```html([\s\S]*?)```/g;
    const processIframes = (content: string): string => {
        return content.replace(iframeRegex, (match, htmlContent) => {
            if (!htmlContent || htmlContent.trim() === '') return '';
            try {
                return `<iframe width="100%" height="600" src="data:text/html;charset=utf-8,${encodeURIComponent(
                    htmlContent
                )}"/>`;
            } catch (e) {
                console.error('Error encoding iframe content:', e);
                return '[Error displaying iframe content]';
            }
        });
    };

    const processedOldContent = processIframes(oldContent);
    const processedNewContent = processIframes(newContent);

    useEffect(() => {
        const animationFrameId = requestAnimationFrame(() => {
            applyDiffHighlighting(oldContainerRef.current, newContainerRef.current);
        });
        return () => cancelAnimationFrame(animationFrameId);
    }, [oldContent, newContent]);

    return (
        <div className="rendered-diff">
            <style>{`
        .diff-deleted {
            background-color: rgba(185, 28, 28, 0.15) !important;
            border-left: 3px solid #b91c1c !important;
            padding-left: 0.5rem !important;
            text-decoration: line-through;
            opacity: 0.75;
            display: block;
            margin: 0.25rem 0;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }
        .diff-added {
            background-color: rgba(16, 185, 129, 0.12) !important;
            border-left: 3px solid #059669 !important;
            padding-left: 0.5rem !important;
            display: block;
            margin: 0.25rem 0;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }
        .dark .diff-deleted {
            background-color: rgba(239, 68, 68, 0.1) !important;
        }
        .dark .diff-added {
            background-color: rgba(16, 185, 129, 0.1) !important;
        }
        li.diff-deleted, li.diff-added {
            margin-left: -0.5rem;
            padding-left: 0.5rem !important;
        }
        pre.diff-deleted > code, pre.diff-added > code {
            display: block;
        }
        pre.diff-deleted, pre.diff-added {
            padding: 1rem !important;
        }
        `}</style>
            <div className="grid grid-cols-2 gap-6">
                <div className="diff-old">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-300 dark:border-slate-700/30">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300">Previous Version</h5>
                    </div>
                    <div
                        ref={oldContainerRef}
                        className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/20 rounded-lg p-4"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeStringify]}
                            components={components}
                        >
                            {processedOldContent}
                        </ReactMarkdown>
                    </div>
                </div>
                <div className="diff-new">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-300 dark:border-slate-700/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-500/50 dark:bg-emerald-500"></div>
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300">New Version</h5>
                    </div>
                    <div
                        ref={newContainerRef}
                        className="text-slate-900 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/20 rounded-lg p-4"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeStringify]}
                            components={components}
                        >
                            {processedNewContent}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
});

export function MarkdownPreviewDiff({
    className,
    sectionId,
    title,
    oldContent,
    newContent,
    onAccept,
    onReject,
}: MarkdownPreviewDiffProps) {
    return (
        <div
            className={cn(
                'prose max-w-none transition-all duration-500',
                className,
                'border border-slate-300 dark:border-primary/20 rounded-xl overflow-hidden bg-white dark:bg-transparent shadow-sm hover:shadow-md transition-shadow'
            )}
        >
            <div className="relative">
                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 dark:from-transparent dark:via-transparent dark:to-transparent"></div>

                {/* Header content */}
                <div className="relative p-4 border-b-2 border-slate-300 dark:border-primary/20 flex justify-between items-center">
                    <h5 className="text-slate-900 dark:text-primary font-medium m-2">Changes to {title}</h5>
                    <div className="flex space-x-3">
                        <button
                            className="px-4 py-1.5 rounded-lg text-red-600 dark:text-red-500 bg-white dark:bg-red-500/10 
                border border-red-100 dark:border-red-500/20 hover:border-red-200 dark:hover:border-red-500/30
                shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative group overflow-hidden"
                            onClick={() => onReject(sectionId)}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-red-500/10 dark:via-transparent dark:to-red-500/10 
                opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"
                            ></div>
                            <span className="relative z-10 font-medium">Reject</span>
                        </button>
                        <button
                            className="px-4 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-500 bg-white dark:bg-emerald-500/10 
                border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/30
                shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative group overflow-hidden"
                            onClick={() => onAccept(sectionId)}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-white to-emerald-500/10 dark:from-emerald-500/10 dark:via-transparent dark:to-emerald-500/10 
                opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"
                            ></div>
                            <span className="relative z-10 font-medium">Accept</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-transparent">
                <div className="bg-white dark:bg-transparent rounded-lg shadow-sm">
                    <DiffViewer oldContent={oldContent} newContent={newContent} />
                </div>
            </div>
        </div>
    );
}
