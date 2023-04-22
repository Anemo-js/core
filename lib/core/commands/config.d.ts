import type { Client, MessageRet, Sendable } from 'oicq';
export declare const ConfigText: string;
export declare function handleConfigCommand(bot: Client, params: string[], reply: (content: Sendable, quote?: boolean | undefined) => Promise<MessageRet>): Promise<MessageRet | undefined>;
