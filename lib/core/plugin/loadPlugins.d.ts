import type { Client } from 'oicq';
import type { AnemoConf } from '@/config';
/** 检索并加载 node_modules 和 plugins 目录下的插件 */
export declare function loadPlugins(bot: Client, anemoConf: AnemoConf): Promise<{
    all: number;
    npm: number;
    local: number;
    cnt: number;
}>;
