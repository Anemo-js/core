/** Anemo 插件错误类 */
export declare class AnemoPluginError extends Error {
    name: string;
    pluginName: string;
    message: string;
    constructor(name: string, message?: string);
    log(): void;
}
