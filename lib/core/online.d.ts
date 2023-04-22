import type { Client } from 'oicq';
import type { AnemoConf } from './config';
/** 监听上线事件，初始化 Anemo */
export declare function onlineHandler(this: Client, anemoConf: AnemoConf): Promise<void>;
