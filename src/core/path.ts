import { join } from 'node:path'
import fs from 'fs'
export const CWD = process.cwd()
const fileList = fs.readdirSync(CWD)
export const configFile: string | undefined = fileList.filter(e=>e.startsWith("bot"))[0]
export const ConfigPath = join(CWD, configFile ?? configFile.toString())
export const NodeModulesDir = join(CWD, 'node_modules')
export const OicqDataDir = join(CWD, 'data/oicq')
export const LogDir = join(CWD, 'logs')
export const PluginDir = join(CWD, 'plugins')
export const PluginDataDir = join(CWD, 'data/plugins')
