import type { Provider, IAgentRuntime } from "@elizaos/core";
import { Edwin } from "edwin-sdk";
import { EdwinConfig } from "edwin-sdk";


export async function getEdwinClient(): Promise<Edwin> {
    const edwinConfig: EdwinConfig = {
        evmPrivateKey: process.env.EVM_PRIVATE_KEY as `0x${string}`,
        solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY as `0x${string}`,
        actions: ["supply", "withdraw", "stake"],
    };
    const edwin = new Edwin(edwinConfig);
    return edwin;
}

export const edwinProvider: Provider = {
    async get(runtime: IAgentRuntime): Promise<string | null> {
        try {
            const edwin = await getEdwinClient();
            const address = edwin.provider.wallets['evm'].getAddress();
            return `Edwin Wallet Address: ${address}`;
        } catch (error) {
            console.error("Error in Edwin provider:", error);
            return null;
        }
    },
};
