import type { Client } from 'oicq';
import type { AnemoConf } from '../config';
/** 通过插件模块路径启用单个插件 */
export declare function enablePlugin(bot: Client, anemoConf: AnemoConf, pluginPath: string): Promise<boolean>;
