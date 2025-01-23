import {
    type Action,
    generateText,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";

import { Edwin, EdwinAction } from "edwin-sdk";

type GetEdwinActionsParams = {
    getClient: () => Promise<Edwin>;
};

/**
 * Get all edwin actions
 */
export async function getEdwinActions({
    getClient,
}: GetEdwinActionsParams): Promise<Action[]> {
    console.log("[getEdwinActions] Starting to fetch Edwin actions");
    const edwin = await getClient();
    console.log("[getEdwinActions] Edwin client fetched");
    const edwinActions = await edwin.getActions();
    console.log(
        `[getEdwinActions] Retrieved ${edwinActions.length} actions from Edwin`
    );
    const actions = edwinActions.map((action: EdwinAction) => ({
        name: action.name.toUpperCase(),
        description: action.description,
        similes: [],
        validate: async () => true,
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State | undefined,
            options?: Record<string, unknown>,
            callback?: HandlerCallback
        ): Promise<boolean> => {
            console.log(
                `[handler] Starting execution for action: ${action.name}`
            );
            try {
                const client = await getClient();
                if (!state) {
                    state = (await runtime.composeState(message)) as State;
                } else {
                    state = await runtime.updateRecentMessageState(state);
                }
                const parameterContext = composeContext({
                    state,
                    template: action.template,
                });
                console.log(
                    "[handler] Parameter context composed: ",
                    parameterContext
                );
                const parameters = await generateObjectDeprecated({
                    runtime,
                    context: parameterContext,
                    modelClass: ModelClass.SMALL,
                });

                console.log("[handler] Parameters generated:", parameters);

                const result = await executeAction(action, parameters, client);
                console.log("[handler] Action executed successfully:", result);

                const responseContext = composeResponseContext(
                    action,
                    result,
                    state
                );
                console.log("[handler] Response context composed");
                const response = await generateResponse(
                    runtime,
                    responseContext
                );
                console.log("[handler] Response generated");
                console.log("[handler] Response:", response);
                console.log("[handler] Result:", result);
                callback?.({ text: response, content: result });
                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    `[handler] Error executing action ${action.name}:`,
                    errorMessage
                );
                callback?.({
                    text: `Error executing action ${action.name}: ${errorMessage}`,
                    content: { error: errorMessage },
                });
                return false;
            }
        },
        examples: [],
    }));
    console.log("[getEdwinActions] Successfully mapped all actions");
    return actions;
}

async function executeAction(
    action: EdwinAction,
    parameters: any,
    edwin: Edwin
): Promise<unknown> {
    console.log(
        `[executeAction] Executing ${action.name} with parameters:`,
        parameters
    );
    const result = await action.execute(parameters);
    console.log(`[executeAction] Action ${action.name} executed successfully`);
    return result;
}

function composeResponseContext(
    action: EdwinAction,
    result: unknown,
    state: State
): string {
    console.log(
        `[composeResponseContext] Composing response context for action: ${action.name}`
    );
    const responseTemplate = `
# Action Examples
{{actionExamples}}

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

The action "${action.name}" was executed successfully.
Here is the result:
${JSON.stringify(result)}

{{actions}}

Respond to the message knowing that the action was successful and these were the previous messages:
{{recentMessages}}
`;
    const context = composeContext({ state, template: responseTemplate });
    console.log(
        "[composeResponseContext] Response context composed successfully"
    );
    return context;
}

async function generateResponse(
    runtime: IAgentRuntime,
    context: string
): Promise<string> {
    console.log("[generateResponse] Generating response");
    const response = await generateText({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
    });
    console.log("[generateResponse] Response generated successfully");
    return response;
}
