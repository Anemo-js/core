"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConfigCommand = exports.ConfigText = void 0;
const config_1 = require("@/config");
const utils_1 = require("@src/utils");
exports.ConfigText = `
〓 Anemo 配置 〓
/config detail
/config admin add/rm <qq>
/config notice on/off
/config friend <operation>
/config group <operation>
`.trim();
const OperationMap = {
    refuse: '拒绝',
    accept: '同意',
    ignore: '忽略'
};
async function handleConfigCommand(bot, params, reply) {
    if (!params.length) {
        await reply(exports.ConfigText);
    }
    const [secondCmd, thirdCmd, value] = params;
    if (secondCmd === 'detail') {
        const { friend } = config_1.anemoConf.notice;
        const subAdmins = config_1.anemoConf.admins.slice(1);
        const detail = `
〓 Anemo 详细配置 〓
登录模式: ${config_1.anemoConf.login_mode ?? '未知'}
设备锁模式: ${config_1.anemoConf.device_mode ?? '未知'}
主管理员: ${config_1.anemoConf.admins[0] ?? '未知'}
副管理员: ${subAdmins.length ? subAdmins.join(', ') : '空'}
通知状态: ${config_1.anemoConf.notice.enable ? '开启' : '关闭'}
好友申请操作: ${OperationMap[friend.request.action] ?? '未知'}
群聊邀请操作: ${OperationMap[friend.request.action] ?? '未知'}
`.trim();
        return reply(detail);
    }
    const mainAdmin = config_1.anemoConf.admins[0];
    if (secondCmd === 'admin') {
        const qq = (0, utils_1.parseUin)(value);
        if (!qq) {
            return reply('〓 目标账号不能为空 〓');
        }
        else {
            const set = new Set(config_1.anemoConf.admins.splice(1));
            if (thirdCmd === 'add') {
                if (set.has(qq) || qq === mainAdmin) {
                    return reply('〓 目标账号已是 Bot 管理员 〓');
                }
                set.add(qq);
                config_1.anemoConf.admins = [mainAdmin, ...set];
                if ((0, config_1.saveAnemoConf)()) {
                    bot.emit('anemo.admin', { admins: [...config_1.anemoConf.admins] });
                    return reply('〓 添加成功 〓');
                }
            }
            else if (thirdCmd === 'rm') {
                if (qq === mainAdmin) {
                    return reply('〓 无法删除 Bot 主管理员 〓');
                }
                if (!set.has(qq)) {
                    return reply('〓 目标账号不是 Bot 管理员 〓');
                }
                set.delete(qq);
                config_1.anemoConf.admins = [mainAdmin, ...set];
                if ((0, config_1.saveAnemoConf)()) {
                    bot.emit('anemo.admin', { admins: [...config_1.anemoConf.admins] });
                    return reply('〓 删除成功 〓');
                }
            }
        }
    }
    if (secondCmd === 'notice') {
        if (thirdCmd === 'on') {
            config_1.anemoConf.notice.enable = true;
            if ((0, config_1.saveAnemoConf)()) {
                reply('〓 事件通知已开启 〓');
            }
        }
        else if (thirdCmd === 'off') {
            config_1.anemoConf.notice.enable = false;
            if ((0, config_1.saveAnemoConf)()) {
                reply('〓 事件通知已关闭 〓');
            }
        }
    }
    if (secondCmd === 'group') {
        if (!['ignore', 'accept', 'refuse'].includes(thirdCmd)) {
            return reply('〓 无效的操作 〓');
        }
        config_1.anemoConf.notice.group.request.action = thirdCmd;
        if ((0, config_1.saveAnemoConf)()) {
            reply(`〓 已设置自动${OperationMap[thirdCmd]}群聊邀请 〓`);
        }
    }
    if (secondCmd === 'friend') {
        if (!['ignore', 'accept', 'refuse'].includes(thirdCmd)) {
            return reply('〓 无效的操作 〓');
        }
        config_1.anemoConf.notice.friend.request.action = thirdCmd;
        if ((0, config_1.saveAnemoConf)()) {
            reply(`〓 已设置自动${OperationMap[thirdCmd]}好友申请 〓`);
        }
    }
}
exports.handleConfigCommand = handleConfigCommand;
