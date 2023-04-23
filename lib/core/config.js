"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAnemoConf = exports.anemoConf = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("./path");
const logger_1 = require("./logger");
const start_1 = require("./start");
exports.anemoConf = {};
/** 保存 Anemo 框架配置到配置文件`bot.json` */
const saveAnemoConf = (_plugins) => {
    try {
        exports.anemoConf.plugins = [...(_plugins ?? start_1.plugins).keys()];
        (0, fs_extra_1.writeJsonSync)(path_1.ConfigPath, exports.anemoConf, { encoding: 'utf-8', spaces: 2 });
        return true;
    }
    catch (e) {
        logger_1.AnemoLogger.error(JSON.stringify(e, null, 2));
        return false;
    }
};
exports.saveAnemoConf = saveAnemoConf;
