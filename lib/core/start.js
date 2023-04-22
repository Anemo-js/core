"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.pkg = exports.plugins = void 0;
const node_path_1 = __importDefault(require("node:path"));
const oicq_1 = require("oicq");
const node_crypto_1 = __importDefault(require("node:crypto"));
const fs_extra_1 = __importStar(require("fs-extra"));
const utils_1 = require("../utils");
const path_1 = require("./path");
const login_1 = require("./login");
const logger_1 = require("./logger");
const config_1 = require("./config");
const logs_1 = require("./logs");
const online_1 = require("./online");
exports.plugins = new Map();
exports.pkg = require(node_path_1.default.join(__dirname, '../../package.json'));
/** 启动框架 */
const start = () => {
    // 设置终端标题
    process.title = `Anemo ${exports.pkg?.version ?? '未知'} `;
    // 打印 Anemo logo
    console.log(`\n${utils_1.colors.cyan(utils_1.LOGO)}\n`);
    if (!fs_extra_1.default.existsSync(path_1.ConfigPath)) {
        (0, utils_1.exitWithError)('配置文件 `bot.json` 不存在');
    }
    /** 捕获 Ctrl C 中断退出 */
    process.on('SIGINT', () => {
        utils_1.notice.success(utils_1.colors.yellow('已退出 Anemo'), true);
        process.exit(0);
    });
    try {
        // 读取框架账号配置文件 `bot.json`
        const conf = require(path_1.ConfigPath);
        // 载入配置到内存
        Object.assign(config_1.anemoConf, conf);
        // 终端标题加上账号
        process.title = `Anemo ${exports.pkg.version} ${config_1.anemoConf.account}`;
        console.log(`欢迎使用 Anemo，轻量、高效、跨平台！\n`);
        console.log('使用文档: ' + utils_1.colors.green('https://beta.anemobot.com'));
        console.log('框架版本: ' + utils_1.colors.green(`@anemobot/core ${exports.pkg.version}`));
        console.log('配置文件: ' + utils_1.colors.green(`${path_1.ConfigPath}\n`));
        const { log_level = 'info', oicq_config = {} } = config_1.anemoConf;
        if (!config_1.anemoConf?.account) {
            (0, utils_1.exitWithError)('无效的配置文件：`bot.json`');
        }
        if (!config_1.anemoConf?.admins || config_1.anemoConf?.admins?.length <= 0) {
            (0, utils_1.exitWithError)('配置文件 `bot.json` 中至少配置一个主管理员');
        }
        // 缺省 oicq 配置
        // 未指定协议时，默认使用 iPad 协议作为 oicq 登录协议
        oicq_config.platform = oicq_config?.platform ?? 5;
        // ociq 数据及缓存保存在 data/oicq 下
        oicq_config.data_dir = path_1.OicqDataDir;
        // oicq 默认日志等级为 info
        oicq_config.log_level = oicq_config?.log_level ?? 'info';
        // 指定默认 ffmpeg 和 ffprobe 命令为全局路径
        oicq_config.ffmpeg_path = oicq_config?.ffmpeg_path ?? 'ffmpeg';
        oicq_config.ffprobe_path = oicq_config?.ffprobe_path ?? 'ffprobe';
        // 重定向日志，oicq 的日志输出到日志文件，Anemo 的日志输出到 console
        (0, logger_1.redirectLog)(log_level, oicq_config, config_1.anemoConf.account);
        // 确保 Anemo 框架相关目录存在
        (0, fs_extra_1.ensureDirSync)(path_1.LogDir);
        (0, fs_extra_1.ensureDirSync)(path_1.PluginDir);
        (0, fs_extra_1.ensureDirSync)(path_1.PluginDataDir);
        const protocol = logger_1.Devices[oicq_config.platform] || '未知';
        logger_1.AnemoLogger.info(utils_1.colors.gray(`使用 ${protocol} 作为 Bot 登录协议`));
        logger_1.AnemoLogger.info(utils_1.colors.gray(`开始登录 Bot ${config_1.anemoConf.account}`));
        logger_1.AnemoLogger.info(utils_1.colors.gray(`正在查找可用服务器...`));
        // 初始化实例
        const bot = (0, oicq_1.createClient)(config_1.anemoConf.account, oicq_config);
        // 取消监听函数个数限制
        bot.setMaxListeners(Infinity);
        // 监听上线事件
        bot.on('system.online', online_1.onlineHandler.bind(bot, config_1.anemoConf));
        // 监听设备锁、滑块和登录错误的事件
        bot.on('system.login.device', login_1.deviceHandler.bind(bot, conf.device_mode));
        bot.on('system.login.slider', ({ url }) => login_1.sliderHandler.call(bot, { isFirst: true, url }));
        bot.on('system.login.error', login_1.errorHandler);
        // 监听下线事件
        bot.on('system.offline', logs_1.offlineHandler);
        // 通过配置文件里指定的模式登录账号
        if (conf.login_mode === 'qrcode') {
            bot.on('system.login.qrcode', login_1.qrCodeHandler).login();
        }
        else {
            const plainPwd = Buffer.from(conf.password || '', 'base64').toString();
            const md5Pwd = node_crypto_1.default.createHash('md5').update(plainPwd).digest();
            bot.login(md5Pwd);
        }
    }
    catch (e) {
        logger_1.AnemoLogger.error(JSON.stringify(e, null, 2));
        (0, utils_1.exitWithError)('无效的配置文件：`bot.json`');
    }
};
exports.start = start;
