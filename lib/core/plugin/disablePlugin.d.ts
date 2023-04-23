import type { Client } from 'oicq';
import type { AnemoConf } from '../config';
import type { AnemoPlugin } from './plugin';
/** 通过插件路径禁用单个插件  */
export declare function disablePlugin(bot: Client, anemoConf: AnemoConf, plugin: AnemoPlugin, pluginPath: string): Promise<boolean>;
