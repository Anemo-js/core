"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
/** 延时异步函数，返回一个 Promise，指定时间（毫秒）后 resolve */
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
exports.wait = wait;
