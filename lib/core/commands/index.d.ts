import type { AllMessageEvent } from '../plugin';
import type { Client } from 'oicq';
import type { AnemoConf } from '../config';
/** 解析框架命令，进行框架操作，仅框架主管理有权限 */
export declare function handleAnemoCommand(event: AllMessageEvent, bot: Client, anemoConf: AnemoConf): Promise<import("../../index").MessageRet | undefined>;
