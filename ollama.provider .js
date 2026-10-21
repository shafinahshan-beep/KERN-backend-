const BaseLLMProvider = require("./base.provider");

class OllamaProvider extends BaseLLMProvider {
    constructor(options = {}) {
        super(options);
        this.model = options.model || "gemma4:latest";
        this.baseUrl = options.baseUrl || "http://127.0.0.1:11434";
    }

    async chat({ messages, tools = [] }) {
        const payload = {
            model: this.model,
            messages: messages,
            stream: false
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
        }

        let response;
        try {
            response = await fetch(`${this.baseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            throw new Error(`Could not connect to Ollama at ${this.baseUrl}: ${err.message}.  Is Ollama running?`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Ollama model error: ${data.error}`);
        }

        const rawMessage = data.message || {};
        const rawToolCalls = rawMessage.tool_calls || [];

        const toolCalls = rawToolCalls.map(tc => {
            let args = tc.function?.arguments || {};
            if (typeof args === "string") {
                try { args = JSON.parse(args); } catch { }
            }

            return {
                id: tc.id || `call_${Math.random().toString(36).substring(2, 10)}`,
                name: tc.function?.name || "",
                arguments: args
            };
        });

        return {
            role: rawMessage.role || "assistant",
            content: rawMessage.content || "",
            thinking: rawMessage.thinking || undefined,
            toolCalls
        };
    }
}

module.exports = OllamaProvider;