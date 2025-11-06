import { projectOverviewPrompt } from '@/lib/ai/prompts/markdown/project-overview';
import { problemStatementPrompt } from '@/lib/ai/prompts/markdown/problem-statement';
import { scopePrompt } from '@/lib/ai/prompts/markdown/scope';
import { userStoriesPrompt } from '@/lib/ai/prompts/markdown/user-stories';
import { useCasesPrompt } from '@/lib/ai/prompts/markdown/use-cases';
import { prototypePrompt } from '@/lib/ai/prompts/markdown/prototype';
import { businessProcessPrompt } from '@/lib/ai/prompts/markdown/business-process';
import { dataModelPrompt } from '@/lib/ai/prompts/markdown/data-model';
import { SectionHistory } from '@/lib/ai/types';
import { PRD_SECTION_TITLES } from '@/lib/ai/const';
import { callOpenAI } from '@/lib/config/openai-client';
import {
    enhanceRelevantInfo,
    updatePlaceholdersInContent,
    verifyCompletedItemsRemoval,
    containsOverviewInfo,
} from './relevant-info';
import { store } from '@/lib/store/store';
import { actions as markdownActions } from '@/app/dashboard/projects/[id]/features/markdown-sections/slice';

export const getMarkdownResponseForSection = async (section: string, relevantInfo: string, history: SectionHistory) => {
    // Get history from the store instead of parameter
    const storeHistory = store.getState().markdown.sectionHistory[section] || history;

    try {
        // Map of section IDs to their prompt functions
        const sectionPrompts: Record<string, (history: { lastContent: string; lastRelevantInfo: string; chatSummary: string }, relevantInfo: string) => string> = {
            'project-overview': projectOverviewPrompt,
            'problem-statement': problemStatementPrompt,
            scope: scopePrompt,
            'user-stories': userStoriesPrompt,
            'use-cases': useCasesPrompt,
            'business-process': businessProcessPrompt,
            'data-model': dataModelPrompt,
            prototype: (history: { lastContent: string; lastRelevantInfo: string; chatSummary: string }) => prototypePrompt(history),
        };

        // Get the appropriate prompt function for this section
        const promptFunction = sectionPrompts[section];

        if (!promptFunction) {
            throw new Error(`No prompt function found for section: ${section}`);
        }

        // Enhance relevant info with section-specific instructions
        const enhancedRelevantInfo = enhanceRelevantInfo(section, relevantInfo, storeHistory);

        // Prepare history with default values for optional properties
        const historyForPrompt = {
            lastContent: storeHistory?.lastContent || '',
            lastRelevantInfo: storeHistory.lastRelevantInfo,
            chatSummary: storeHistory.chatSummary,
        };

        // Generate the prompt section by section
        const prompt = promptFunction(historyForPrompt, enhancedRelevantInfo);

        // Use previous content as prediction if it exists and is substantial
        const prediction =
            storeHistory?.lastContent && storeHistory.lastContent.length > 100
                ? {
                      type: 'content' as const,
                      content: storeHistory.lastContent,
                  }
                : undefined;

        // Call the OpenAI API with the prompt and prediction
        const response = await callOpenAI<string>(prompt, [{ role: 'user', content: enhancedRelevantInfo }], {
            logLabel: `${section} Section Generation`,
            maxTokens: 4000,
            temperature: 0.7,
            parseResponse: false,
            prediction,
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to generate section content');
        }

        // Log prediction stats if available
        if (response.usage?.completion_tokens_details) {
            console.log(`${section} Section Prediction Stats:`, {
                accepted: response.usage.completion_tokens_details.accepted_prediction_tokens,
                rejected: response.usage.completion_tokens_details.rejected_prediction_tokens,
            });
        }

        let content = response.data || '';

        // Ensure proper title format
        content = content.replace(/^# .*$/gm, '');
        content = `# ${PRD_SECTION_TITLES[section as keyof typeof PRD_SECTION_TITLES] || section}\n${content.trim()}`;

        // Double-check for placeholders that should have been replaced (Add more)
        if (section === 'project-overview' && containsOverviewInfo(relevantInfo)) {
            // Count [PENDING] placeholders in the output
            const pendingCount = (content.match(/\[PENDING\]/g) || []).length;

            if (pendingCount > 0) {
                console.warn(
                    `Warning: ${pendingCount} [PENDING] placeholders remain in Project Overview despite stakeholder info being provided!`
                );

                // Try to directly replace placeholders
                content = updatePlaceholdersInContent(content, relevantInfo);
            }
        } else if (section === 'problem-statement') {
            // Count [PENDING] placeholders in the output
            const pendingCount = (content.match(/\[PENDING\]/g) || []).length;

            if (pendingCount > 0) {
                console.warn(
                    `Warning: ${pendingCount} [PENDING] placeholders remain in Problem Statement despite metrics info being provided!`
                );

                // Try to directly replace placeholders
                content = updatePlaceholdersInContent(content, relevantInfo);
            }
        }

        // Verify that completed tasks were removed
        if (storeHistory.lastContent) {
            const stillExistingCompletedItems = verifyCompletedItemsRemoval(storeHistory.lastContent, content);

            if (stillExistingCompletedItems.length > 0) {
                console.warn(
                    `Warning: ${stillExistingCompletedItems.length} completed items were not removed from Next Steps!`
                );
            }
        }

        // Update history in the store
        store.dispatch(
            markdownActions.updateSectionHistory({
                sectionId: section,
                history: {
                    ...storeHistory,
                    lastContent: content,
                    lastUpdate: Date.now(),
                },
            })
        );

        return content;
    } catch (error) {
        console.error(`Error generating markdown for section ${section}:`, error);
        // Return existing content if available, otherwise empty string
        return storeHistory?.lastContent || '';
    }
};