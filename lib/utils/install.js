"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const _src_1 = require("@src");
async function install(pkg = '') {
    const promiseExec = (0, node_util_1.promisify)(node_child_process_1.exec);
    const cmd = `npm i ${pkg} --registry=https://registry.npmmirror.com`;
    try {
        const { stderr } = await promiseExec(cmd);
        if (stderr) {
            if (/npm ERR/i.test(String(stderr))) {
                return false;
            }
        }
        return true;
    }
    catch (e) {
        _src_1.AnemoLogger.error(JSON.stringify(e, null, 2));
        return false;
    }
}
exports.install = install;
