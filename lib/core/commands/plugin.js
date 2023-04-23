"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePluginCommand = exports.PluginText = void 0;
const plugin_1 = require("../plugin");
const config_1 = require("../config");
const start_1 = require("../start");
const utils_1 = require("../../utils");
exports.PluginText = `
〓 Anemo 插件 〓
/plugin list
/plugin add <name>
/plugin on/off <name>
/plugin onall/offall
/plugin reload <name>
/plugin update <?name>
`.trim();
async function handlePluginCommand(bot, params, reply) {
    if (!params.length) {
        return await reply(exports.PluginText);
    }
    const [secondCmd, pluginName] = params;
    if (secondCmd === 'list') {
        const { plugins: allPlugins } = await (0, plugin_1.searchAllPlugins)();
        const pluginInfo = allPlugins.map((pn) => {
            const name = (0, plugin_1.getPluginNameByPath)(pn);
            const plugin = start_1.plugins.get(name);
            return `${plugin ? '●' : '○'} ${name}${plugin ? ` (${plugin.version})` : ''}`;
        });
        const message = `
〓 Anemo 插件列表 〓
${pluginInfo.join('\n')}
共 ${pluginInfo.length} 个，启用 ${start_1.plugins.size} 个
`.trim();
        return reply(message);
    }
    if (secondCmd === 'onall') {
        const { plugins: ps, cnts: { all } } = await (0, plugin_1.searchAllPlugins)();
        if (all === 0) {
            return reply('〓 插件列表为空 〓');
        }
        if (ps.length === start_1.plugins.size) {
            return reply('〓 所有插件均已启用 〓');
        }
        ps.forEach(async (path, i) => {
            const pluginName = (0, plugin_1.getPluginNameByPath)(path);
            if (start_1.plugins.has(pluginName)) {
                // 过滤已经启用了的插件
                return;
            }
            await (0, plugin_1.enablePlugin)(bot, config_1.anemoConf, path);
            if (i + 1 === all) {
                (0, config_1.saveAnemoConf)();
                return reply('〓 已启用所有插件 〓');
            }
        });
        return;
    }
    if (secondCmd === 'offall') {
        const size = start_1.plugins.size;
        if (!size) {
            return reply('〓 所有插件均已禁用 〓');
        }
        Array.from(start_1.plugins.entries()).forEach(async ([pluginName, plugin], i) => {
            const targetPluginPath = await (0, plugin_1.getPluginPathByName)(pluginName);
            if (targetPluginPath) {
                await (0, plugin_1.disablePlugin)(bot, config_1.anemoConf, plugin, targetPluginPath);
                start_1.plugins.delete(pluginName);
            }
            if (i + 1 === size) {
                (0, config_1.saveAnemoConf)(start_1.plugins);
                return reply('〓 已禁用所有插件 〓');
            }
        });
        return;
    }
    if (secondCmd === 'update') {
        reply('〓 正在检查插件更新... 〓');
        const upInfo = await (0, utils_1.update)(`anemobot-plugin-${pluginName || '*'}`);
        if (upInfo) {
            const info = Object.entries(upInfo)
                .map(([k, v]) => `${k.replace('anemobot-plugin-', '')} => ${v.replace('^', '')}`)
                .join('\n');
            await reply(info ? `〓 插件更新成功 〓\n${info}` : '〓 所有插件均为最新版本 〓');
        }
        else {
            await reply('〓 更新失败 〓');
        }
        process.title = `Anemo ${start_1.pkg.version} ${config_1.anemoConf.account}`;
        return;
    }
    if (secondCmd === 'on') {
        if (!pluginName) {
            return reply('〓 插件名不为空 〓');
        }
        const targetPluginPath = await (0, plugin_1.getPluginPathByName)(pluginName);
        if (!targetPluginPath) {
            return reply(`〓 ${pluginName.slice(0, 12)}: 插件不存在 〓`);
        }
        if (start_1.plugins.has(pluginName)) {
            return reply(`〓 ${pluginName.slice(0, 12)}: 插件已启用 〓`);
        }
        const isOK = await (0, plugin_1.enablePlugin)(bot, config_1.anemoConf, targetPluginPath);
        if (isOK) {
            (0, config_1.saveAnemoConf)();
            return reply('〓 启用成功 〓');
        }
    }
    if (secondCmd === 'off') {
        if (!pluginName) {
            return reply('〓 插件名不为空 〓');
        }
        const plugin = start_1.plugins.get(pluginName);
        if (!plugin) {
            return reply(`〓 ${pluginName.slice(0, 12)}: 插件不存在 〓`);
        }
        const targetPluginPath = await (0, plugin_1.getPluginPathByName)(pluginName);
        if (!targetPluginPath) {
            return reply(`〓 ${pluginName.slice(0, 12)}: 插件不存在 〓`);
        }
        const isOK = await (0, plugin_1.disablePlugin)(bot, config_1.anemoConf, plugin, targetPluginPath);
        if (isOK) {
            start_1.plugins.delete(pluginName);
            (0, config_1.saveAnemoConf)();
            return reply('〓 禁用成功 〓');
        }
    }
    if (secondCmd === 'reload') {
        if (!pluginName) {
            return reply('〓 插件名不为空 〓');
        }
        const plugin = start_1.plugins.get(pluginName);
        const targetPluginPath = await (0, plugin_1.getPluginPathByName)(pluginName);
        if (!targetPluginPath) {
            return reply(`〓 ${pluginName.slice(0, 12)}: 插件不存在 〓`);
        }
        let isOK = false;
        if (!plugin) {
            isOK = await (0, plugin_1.enablePlugin)(bot, config_1.anemoConf, targetPluginPath);
        }
        else {
            isOK = await (0, plugin_1.disablePlugin)(bot, config_1.anemoConf, plugin, targetPluginPath);
            isOK = isOK && (await (0, plugin_1.enablePlugin)(bot, config_1.anemoConf, targetPluginPath));
        }
        if (isOK) {
            (0, config_1.saveAnemoConf)();
            return reply('〓 重载成功 〓');
        }
    }
    if (secondCmd === 'add') {
        if (!pluginName) {
            return reply('〓 插件名不为空 〓');
        }
        let shortName = pluginName;
        if (/^anemobot-plugin-/i.test(shortName)) {
            shortName = shortName.replace(/^anemobot-plugin-/i, '');
        }
        reply('〓 正在安装... 〓');
        if (await (0, utils_1.install)(`anemobot-plugin-${shortName}`)) {
            await reply('〓 插件安装成功 〓');
        }
        else {
            await reply('〓 安装失败 〓');
        }
        process.title = `Anemo ${start_1.pkg.version} ${config_1.anemoConf.account}`;
    }
}
exports.handlePluginCommand = handlePluginCommand;
