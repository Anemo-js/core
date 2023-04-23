"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineHandler = void 0;
const bindSendMessage_1 = require("./bindSendMessage");
const utils_1 = require("../utils");
const notice_1 = require("./notice");
const commands_1 = require("./commands");
const logger_1 = require("./logger");
const plugin_1 = require("./plugin");
const logs_1 = require("./logs");
/** 监听上线事件，初始化 Anemo */
async function onlineHandler(anemoConf) {
    const error = (msg, ...args) => {
        this.logger.error(msg, ...args);
        logger_1.AnemoLogger.error(msg, ...args);
    };
    const info = (msg, ...args) => {
        this.logger.info(msg, ...args);
        logger_1.AnemoLogger.info(msg, ...args);
    };
    info(utils_1.colors.green(`${this.nickname}(${this.uin}) 上线成功！发送 /help 指令查看用法。`));
    /** 全局错误处理函数 */
    const handleGlobalError = (e) => {
        if (e instanceof plugin_1.AnemoPluginError) {
            logger_1.PluginLogger.error(`[${e.pluginName}] ${e.message}`);
        }
        else {
            error(e?.message || e?.stack || JSON.stringify(e));
        }
    };
    // 捕获全局 Rejection，防止框架崩溃
    process.on('unhandledRejection', handleGlobalError);
    // 捕获全局 Exception，防止框架崩溃
    process.on('uncaughtException', handleGlobalError);
    // 绑定发送消息，打印发送日志
    (0, bindSendMessage_1.bindSendMessage)(this);
    // 监听消息，打印日志，同时处理框架命令
    this.on('message', (event) => {
        (0, logs_1.messageHandler)(event);
        (0, commands_1.handleAnemoCommand)(event, this, anemoConf);
    });
    // 监听通知、请求，打印框架日志
    this.on('notice', logs_1.noticeHandler);
    this.on('request', logs_1.requestHandler);
    // 设置消息通知
    (0, notice_1.configNotice)(this);
    // 检索并加载插件
    const { all, cnt, npm, local } = await (0, plugin_1.loadPlugins)(this, anemoConf);
    info(utils_1.colors.cyan(`共检索到 ${all} 个插件 (${local} 个本地，${npm} 个 npm), 启用 ${cnt} 个`));
    // 初始化完成
    logger_1.AnemoLogger.info(utils_1.colors.gray('框架初始化完成'));
    logger_1.AnemoLogger.info(utils_1.colors.gray('开始处理消息...'));
    // 上线通知，通知 Bot 主管理
    if (!anemoConf.admins[0]) {
        error(utils_1.colors.red('主管理员必须添加 Bot 为好友，否则无法正常控制 Bot 和发送消息通知'));
    }
    else {
        const mainAdmin = this.pickFriend(anemoConf.admins[0]);
        await (0, utils_1.wait)(600);
        await mainAdmin.sendMsg('上线成功，发送 /help 查看帮助');
    }
}
exports.onlineHandler = onlineHandler;
