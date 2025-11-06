import { MarkdownSection } from '../types';

/**
 * Determines the completion status of a markdown section based on its content.
 * Checks for content length and specific rating patterns.
 *
 * @param section - The markdown section object.
 * @returns The completion status: "not-started", "in-progress", or "complete".
 */
export function getSectionCompletionStatus(section: MarkdownSection): 'not-started' | 'in-progress' | 'complete' {
    const content = section.content;

    // Basic check: If content is very short, consider it not started.
    if (content.split('\n').length <= 2) {
        return 'not-started';
    }

    // Check for rating pattern to determine progress/completion.
    const ratingMatch = content.match(/⭐ Provided Information Rating: ([★☆]+)/);
    if (ratingMatch) {
        const rating = ratingMatch[1];
        if (rating === '★★★★★') {
            return 'complete'; // 5 stars = complete
        }
        if (rating.includes('★')) {
            return 'in-progress'; // Any star = in-progress
        }
    }

    // Default to not-started if no other criteria met.
    return 'not-started';
}
