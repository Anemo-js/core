"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disablePlugin = void 0;
const utils_1 = require("../../utils");
const getPluginNameByPath_1 = require("./getPluginNameByPath");
const killPlugin_1 = require("./killPlugin");
const logger_1 = require("../logger");
const pluginError_1 = require("./pluginError");
/** 通过插件路径禁用单个插件  */
async function disablePlugin(bot, anemoConf, plugin, pluginPath) {
    const error = (msg, ...args) => {
        bot.logger.error(msg, ...args);
        logger_1.AnemoLogger.error(msg, ...args);
    };
    const info = (msg, ...args) => {
        bot.logger.info(msg, ...args);
        logger_1.AnemoLogger.info(msg, ...args);
    };
    logger_1.AnemoLogger.debug('disablePlugin: ' + pluginPath);
    const pluginName = (0, getPluginNameByPath_1.getPluginNameByPath)(pluginPath);
    const pn = utils_1.colors.green(pluginName);
    try {
        // 调用插件挂载的禁用函数
        await plugin.unmountAnemoClient(bot, [...anemoConf.admins]);
        // 删除 require 缓存
        (0, killPlugin_1.killPlugin)(pluginPath);
        info(`插件 ${pn} 禁用成功`);
        return true;
    }
    catch (e) {
        if (e instanceof pluginError_1.AnemoPluginError) {
            e.log();
        }
        else {
            error(`插件 ${pn} 禁用过程中发生错误: \n${JSON.stringify(e, null, 2)}`);
        }
    }
    return false;
}
exports.disablePlugin = disablePlugin;
