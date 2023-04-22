import type { Client, MessageRet, Sendable } from 'oicq';
export declare const PluginText: string;
export declare function handlePluginCommand(bot: Client, params: string[], reply: (content: Sendable, quote?: boolean | undefined) => Promise<MessageRet>): Promise<MessageRet | undefined>;
