"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAnemoCommand = void 0;
const minimist_1 = __importDefault(require("minimist"));
const status_1 = require("./status");
const config_1 = require("./config");
const plugin_1 = require("./plugin");
const _src_1 = require("../../index");
const utils_1 = require("../../utils");
const start_1 = require("../start");
const HelpText = `
〓 Anemo 帮助 〓
/plugin  插件操作
/status  查看状态
/config  框架配置
/update  检查更新
/about   关于框架
/exit    退出框架
`.trim();
const AboutText = `
〓 关于 Anemo 〓
Anemo 是一个开源、轻量、跨平台的 QQ 机器人框架，基于 Node.js 和 oicq v2 构建。
使用文档: https://beta.anemobot.com/
开源地址: https://github.com/AnemoLab/Anemo
`.trim();
/** 解析框架命令，进行框架操作，仅框架主管理有权限 */
async function handleAnemoCommand(event, bot, anemoConf) {
    const msg = event.toString().trim();
    if (!/^\/[a-z]+/.test(msg)) {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _: params, '--': __, ...options } = (0, minimist_1.default)(msg.split(/\s+/));
    const cmd = params.shift()?.replace('/', '') || '';
    const reply = event.reply.bind(event);
    // 是否是管理员
    const isAdmin = anemoConf.admins.includes(event.sender.user_id);
    // 是否是主管理员
    const isMainAdmin = anemoConf.admins[0] === event.sender.user_id;
    // 过滤非管理员消息
    if (!isAdmin)
        return;
    if (cmd === 'help') {
        return reply(HelpText);
    }
    if (cmd === 'about') {
        return reply(AboutText);
    }
    if (cmd === 'status') {
        try {
            const status = await (0, status_1.fetchStatus)(bot);
            return reply(status);
        }
        catch (e) {
            _src_1.AnemoLogger.error(JSON.stringify(e, null, 2));
            return reply('设备状态信息获取失败，错误信息:\n' + JSON.stringify(e, null, 2));
        }
    }
    // 过滤非主管理员命令
    if (!isMainAdmin)
        return;
    if (cmd === 'exit') {
        await reply('〓 Anemo 进程已停止 〓');
        utils_1.notice.success('框架进程已由管理员通过 /exit 消息指令退出');
        process.exit(0);
    }
    if (cmd === 'plugin') {
        return (0, plugin_1.handlePluginCommand)(bot, params, reply);
    }
    if (cmd === 'config') {
        return (0, config_1.handleConfigCommand)(bot, params, reply);
    }
    if (cmd === 'update') {
        reply('〓 正在检查更新... 〓');
        const upInfo = await (0, utils_1.update)();
        if (upInfo) {
            const info = Object.entries(upInfo)
                .map(([k, v]) => `${k} => ${v.replace('^', '')}`)
                .join('\n');
            await reply(info ? `〓 更新完成 〓\n${info}` : '〓 所有依赖均为最新版本 〓');
        }
        else {
            await reply('〓 更新失败 〓');
        }
        process.title = `Anemo ${start_1.pkg.version} ${anemoConf.account}`;
    }
}
exports.handleAnemoCommand = handleAnemoCommand;
