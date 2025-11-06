import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import LoadingDots from '../../../../../../../../components/ui/loading-dots';
import { Button, ButtonProps } from '@/components/ui/button';
import { MarkdownPreview } from '@/app/dashboard/projects/[id]/features/markdown-sections/components/markdown-preview';

// ChatBubble
const chatBubbleVariant = cva('flex gap-2 max-w-[60%] items-end relative group', {
    variants: {
        variant: {
            received: 'self-start',
            sent: 'self-end flex-row-reverse',
        },
        layout: {
            default: '',
            ai: 'max-w-full w-full items-center',
        },
    },
    defaultVariants: {
        variant: 'received',
        layout: 'default',
    },
});

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleVariant> {}

const ChatBubbleComponent = ({ variant = 'received', className, children, ...props }: ChatBubbleProps) => {
    return (
        <div className={cn('flex', variant === 'sent' ? 'justify-end' : 'justify-start', className)} {...props}>
            <div
                className={cn(
                    variant === 'sent'
                        ? 'bg-primary text-white rounded-2xl rounded-br-sm shadow-md dark:bg-gradient-to-br dark:from-primary dark:to-primary/80 dark:shadow-glow'
                        : 'bg-violet-50 text-gray-900 rounded-2xl rounded-bl-sm shadow-sm border border-violet-100 dark:bg-gradient-to-br dark:from-[#2D2D2D] dark:to-[#202020] dark:text-foreground dark:border-white/5 dark:shadow-md',
                    'px-4 py-2.5 max-w-[85%] backdrop-blur-sm',
                    variant === 'sent' ? 'mr-1' : 'ml-1',
                    'my-1 transition-all duration-200'
                )}
            >
                {children}
            </div>
        </div>
    );
};

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
    src?: string;
    fallback?: string;
    className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ src, fallback, className }) => (
    <Avatar className={className}>
        <AvatarImage src={src} alt="Avatar" />
        <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
);

// ChatBubbleMessage
const chatBubbleMessageVariants = cva('p-4', {
    variants: {
        variant: {
            received: 'bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg',
            sent: 'bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg',
        },
        layout: {
            default: '',
            ai: 'border-t w-full rounded-none bg-transparent',
        },
    },
    defaultVariants: {
        variant: 'received',
        layout: 'default',
    },
});

interface ChatBubbleMessageProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatBubbleMessageVariants> {
    isLoading?: boolean;
    renderMarkdown?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
    ({ className, variant, layout, isLoading = false, renderMarkdown = true, children, ...props }, ref) => {
        // Check if the content is a string and contains markdown
        const hasMarkdownContent =
            typeof children === 'string' &&
            (children.includes('**') || children.includes('##') || children.includes('- ') || children.includes('1. '));

        return (
            <div className={cn('break-words max-w-full', className)} ref={ref} {...props}>
                {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <LoadingDots />
                    </div>
                ) : hasMarkdownContent && renderMarkdown ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownPreview content={children as string} />
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{children}</div>
                )}
            </div>
        );
    }
);
ChatBubbleMessage.displayName = 'ChatBubbleMessage';

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps extends React.HTMLAttributes<HTMLDivElement> {
    timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({ timestamp, className, ...props }) => (
    <div className={cn('text-xs mt-2 text-right opacity-70', className)} {...props}>
        {timestamp}
    </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
    icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
    icon,
    onClick,
    className,
    variant = 'ghost',
    size = 'icon',
    ...props
}) => (
    <Button
        variant={variant}
        size={size}
        className={cn('opacity-80 hover:opacity-100', className)}
        onClick={onClick}
        {...props}
    >
        {icon}
    </Button>
);

interface ChatBubbleActionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'sent' | 'received';
    className?: string;
}

const ChatBubbleActionWrapper = React.forwardRef<HTMLDivElement, ChatBubbleActionWrapperProps>(
    ({ variant, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                variant === 'sent' ? '-left-1 -translate-x-full flex-row-reverse' : '-right-1 translate-x-full',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
ChatBubbleActionWrapper.displayName = 'ChatBubbleActionWrapper';

export {
    ChatBubbleComponent as ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
    chatBubbleVariant,
    chatBubbleMessageVariants,
    ChatBubbleAction,
    ChatBubbleActionWrapper,
};
