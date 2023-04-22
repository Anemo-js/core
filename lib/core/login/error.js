"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const oicq_1 = require("oicq");
const logger_1 = require("../logger");
const utils_1 = require("../../utils");
/** 登录错误事件监听处理函数 */
function errorHandler({ code, message }) {
    const error = (msg, ...args) => {
        this.logger.error(msg, ...args);
        logger_1.AnemoLogger.error(msg, ...args);
    };
    if (code === oicq_1.LoginErrorCode.AccountFrozen) {
        error(`Bot 账号 ${this.uin} 被冻结，请在解除冻结后再尝试登录`);
        process.exit(0);
    }
    if (code === oicq_1.LoginErrorCode.WrongPassword) {
        error('账号密码错误，请通过 `kivi init --force` 命令重新生成正确的配置文件');
        process.exit(0);
    }
    if (code === oicq_1.LoginErrorCode.TooManySms) {
        (0, utils_1.exitWithError)('验证码发送过于频繁，请先退出框架，稍后再试');
    }
    if (code === oicq_1.LoginErrorCode.WrongSmsCode) {
        error('短信验证码错误，验证失败，请退出框架后重新启动');
        process.exit(0);
    }
    error(`登录错误: ${code}，错误信息: ${message}`);
}
exports.errorHandler = errorHandler;
