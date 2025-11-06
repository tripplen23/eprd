
type Response = {
    content: string;
    role: 'assistant';
}

type LLMPayload = {
    content: string;
    role: 'user' | 'system';
}

type StateStore = {}

type LLMFunc = (payload: LLMPayload) => Response;
export class BaseAgent {
    protected systemPrompt: string;
    protected llmConfig: LLMFunc;
    protected stateStore: StateStore;

    constructor(
        systemPrompt: string,
        llmConfig: LLMFunc,
        stateStore: StateStore
    ) {
        this.systemPrompt = systemPrompt;
        this.llmConfig = llmConfig;
        this.stateStore = stateStore;
    }

    async getResponse(payload: LLMPayload) {

    }

}
