"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enablePlugin = void 0;
const utils_1 = require("../../utils");
const getPluginNameByPath_1 = require("./getPluginNameByPath");
const logger_1 = require("../logger");
const pluginError_1 = require("./pluginError");
const start_1 = require("../start");
/** 通过插件模块路径启用单个插件 */
async function enablePlugin(bot, anemoConf, pluginPath) {
    const error = (msg, ...args) => {
        bot.logger.error(msg, ...args);
        logger_1.AnemoLogger.error(msg, ...args);
    };
    const info = (msg, ...args) => {
        bot.logger.info(msg, ...args);
        logger_1.AnemoLogger.info(msg, ...args);
    };
    logger_1.AnemoLogger.debug('enablePlugin: ' + pluginPath);
    const pluginName = (0, getPluginNameByPath_1.getPluginNameByPath)(pluginPath);
    const pn = utils_1.colors.green(pluginName);
    try {
        const { plugin } = (await require(pluginPath));
        if (plugin && plugin?.mountAnemoClient) {
            try {
                await plugin.mountAnemoClient(bot, [...anemoConf.admins]);
                start_1.plugins.set(pluginName, plugin);
                info(`插件 ${pn} 启用成功`);
                return true;
            }
            catch (e) {
                logger_1.AnemoLogger.error(JSON.stringify(e, null, 2));
                if (e instanceof pluginError_1.AnemoPluginError) {
                    e.log();
                }
                else {
                    error(`插件 ${pn} 启用过程中发生错误: \n${JSON.stringify(e, null, 2)}`);
                }
            }
        }
        else {
            error(utils_1.colors.red(`插件 ${pn} 没有导出 \`AnemoPlugin\` 类实例的 \`plugin\` 属性`));
        }
    }
    catch (e) {
        if (e instanceof pluginError_1.AnemoPluginError) {
            e.log();
        }
        else {
            error(`插件 ${pn} 导入过程中发生错误: \n${JSON.stringify(e, null, 2)}`);
        }
    }
    start_1.plugins.delete(pluginName);
    return false;
}
exports.enablePlugin = enablePlugin;
