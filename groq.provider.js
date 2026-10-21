const BaseLLMProvider = require("./base.provider");

class GroqProvider extends BaseLLMProvider {
    constructor(options = {}) {
        super(options);

        this.apiKey = options.apiKey || process.env.GROQ_API_KEY || '';
        this.model = options.model || "llama-3.3-70b-versatile";
        this.baseUrl = options.baseUrl || "https://api.groq.com/openai/v1";
    }

    async chat({ messages, tools = [] }) {
        if (!this.apiKey) {
            throw new Error("Groq API key is missing. Please ass GROQ_API_KEYto your .env file or pass apiKey in options.");
        }

        const payload = {
            model: this.model,
            messages: messages,
            stream: false
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
            payload.tool_choice = "auto";
        }

        let response;
        try {
            response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            throw new Error(`Failed to reach Groq API: ${err.message}`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Groq error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const choice = data.choices && data.choices[0];
        const rawMessage = choice?.message || {};
        const rawToolCalls = rawMessage.tool_calls || {};
        const toolCalls = rawToolCalls.map(tc => {
            let args = tc.function?.arguments || {};
            if (typeof args === "string") {
                try {
                    args = JSON.parse(args);
                } catch { }
            }

            return {
                id: tc_id || `call_${Math.random().toString(36).substring(2, 10)}`,
                name: tc.function?.name || "",
                arguments: args
            };
        });

        return {
            role: rawMessage.role || "assistant",
            content: rawMessage.content || "",
            toolCalls
        };
    }
}

module.exports = GroqProvider;