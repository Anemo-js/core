"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUin = void 0;
/** 解析 qq，支持艾特，可以是 `1141284758` 或者是 `{at:1141284758}` */
function parseUin(qqLikeStr) {
    let qq = 0;
    if (/^\{at:\d+\}$/.test(qqLikeStr)) {
        qq = Number(/^\{at:(\d+)\}$/.exec(qqLikeStr)[1]);
    }
    else if (/^\d+$/.test(qqLikeStr)) {
        qq = Number(/^(\d+)$/.exec(qqLikeStr)[1]);
    }
    return qq;
}
exports.parseUin = parseUin;
