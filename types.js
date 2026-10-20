// [NOTE: Amra test case run korar jonno Ollama use korbo with Gemma 4b model.]
// [NOTE: Ollama use korar jonno Amake Ollama start korte hobe. Ollama start korar jonno terminal e Ollama run kora lagbe. Ollama command: Ollama ]
// [NOTE: Ami ekhane amr understanding e note add korsi. JODI keu aro bhalo bujhe thake tahole koshto kore edit kore nio OR amk bolle ami edit kre dibo.]

const roles = {                         //Ekhane amra 4 ta standard participent use korbo
    System: "system",                   //system ba prompt er instructions
    User: "user",                       //User ba Amader message
    Assistant: "assistant",             //AI ba chatbot system ba LLM er message
    Tool: "tool"                        //Amra LLM ba chatbot system ke Tool use korar jonno message pathabo
};

function createUserMessage(content) {
    return {
        role: roles.User,             // ekhane user message ta system message e convert hobe.
        content: String(content)        // content er value string e convert hobe
    }
}

function createAssistantMessage(content = "", toolCalls = []) {     // jodi user kono text chara input dae taile "" show korbe. As a result kono error amra pabo na. And AI jodi kono tool use na kore, taile amra empty array[] return pabo.
    const msg = {
        role: roles.Assistant,      // eta AI er messsage hold kore.
        content: content || ""      // jodi content NULL or undefined hoe then return e "" pabo.
    };
    if (toolCalls && toolCalls.length > 0) {    // jodi toolCalls e value thake taile show korbe, na hole show korbe na. Also eta toolCalls er existence check kore. [NOTE: LLM like Ollama onk shomoy error dekhate pare jodi toolCalls e value na thake] Jekhane toolCalls = [] use kora hoyeche.
        msg.tool_calls = toolCalls;     // toolCalls er value ta msg e add kore dae.
    }
    return msg;
}

function createToolMessage(toolCallId, name, content) {
    return {
        role: roles.Tool,       // eta tool call er message hold kore.
        tool_call_id: toolCallId,   // ekhane toolCallId ta ekta specific tool use kora hole oi tool er id ta ekhane show korbe.
        name: name,                 // ekhane tool er name show korbe.
        content: typeof content === "object" ? JSON.stringify(content, null, 2) : String(content)   // ekhane tool er content show korbe.
    };
}

function createToolResult({ toolCallId, name, success, output = "", error = null }) {
    return {
        toolCallId,
        name,
        success: Boolean(success),  // ekhane tool er success message show korbe.
        output: String(output),     // ekhane tool er output message show korbe.
        error: error ? String(error) : null     // ekhane tool er error message show korbe. Also jodi kono error thake taile oi error message ta shoe korbe. ekhon shob ekhane likhe dao.
    };
}

function defineTool({ name, description, properties = {}, required = [] }) {    // amra jodi upore kheal kori tahole dekhbo je we used content as object.  to eta basically object ta ke json string e convert kore ja AI easily read korte pare.
    return {
        type: "function",    // eta holo ekta callable code function jeta LLM engine ke bujhano hoe.
        function: {
            name,
            description,
            parameters: {
                type: "object",
                properties,
                required    // for example: amra AI ke ekta file read korte dilam. taile or ei file ta locate korar jonno ekta file path lagbe. to ei file path ta holo required.
            }
        }
    };
}

module.exports = {
    roles,
    createUserMessage,
    createAssistantMessage,
    createToolMessage,
    createToolResult,
    defineTool
}
