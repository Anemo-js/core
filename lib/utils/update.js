"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const npm_check_updates_1 = __importDefault(require("npm-check-updates"));
const node_path_1 = __importDefault(require("node:path"));
const core_1 = require("../core");
/** 更新依赖 */
async function update(pkg = '') {
    const promiseExec = (0, node_util_1.promisify)(node_child_process_1.exec);
    const upInfo = await (0, npm_check_updates_1.default)({
        packageFile: node_path_1.default.join(core_1.CWD, 'package.json'),
        filter: pkg || ['@anemo/*', 'anemo', 'anemo-*'],
        upgrade: true,
        jsonUpgraded: true,
        registry: 'https://registry.npmmirror.com'
    });
    const npmUpCmd = `npm up ${pkg} --registry=https://registry.npmmirror.com`;
    try {
        const { stderr } = await promiseExec(npmUpCmd);
        if (stderr) {
            if (/npm ERR/i.test(String(stderr))) {
                return false;
            }
        }
        return upInfo;
    }
    catch (e) {
        core_1.AnemoLogger.error(JSON.stringify(e, null, 2));
        return false;
    }
}
exports.update = update;
