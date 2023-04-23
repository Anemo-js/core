import { colors } from '@src/utils'
import { getPluginNameByPath } from './getPluginNameByPath'
import { AnemoLogger } from '@/logger'
import { AnemoPluginError } from './pluginError'
import { plugins } from '@/start'

import type { Client } from 'oicq'
import type { AnemoConf } from '@/config'
import type { AnemoPlugin } from './plugin'

/** 通过插件模块路径启用单个插件 */
export async function enablePlugin(bot: Client, anemoConf: AnemoConf, pluginPath: string) {
  const error = (msg: any, ...args: any[]) => {
    bot.logger.error(msg, ...args)
    AnemoLogger.error(msg, ...args)
  }

  const info = (msg: any, ...args: any[]) => {
    bot.logger.info(msg, ...args)
    AnemoLogger.info(msg, ...args)
  }

  AnemoLogger.debug('enablePlugin: ' + pluginPath)

  const pluginName = getPluginNameByPath(pluginPath)
  const pn = colors.green(pluginName)

  try {
    const { plugin } = (await require(pluginPath)) as { plugin: AnemoPlugin | undefined }

    if (plugin && plugin?.mountAnemoClient) {
      try {
        await plugin.mountAnemoClient(bot, [...anemoConf.admins])

        plugins.set(pluginName, plugin)

        info(`插件 ${pn} 启用成功`)

        return true
      } catch (e) {
        AnemoLogger.error(JSON.stringify(e, null, 2))

        if (e instanceof AnemoPluginError) {
          e.log()
        } else {
          error(`插件 ${pn} 启用过程中发生错误: \n${JSON.stringify(e, null, 2)}`)
        }
      }
    } else {
      error(colors.red(`插件 ${pn} 没有导出 \`AnemoPlugin\` 类实例的 \`plugin\` 属性`))
    }
  } catch (e) {
    if (e instanceof AnemoPluginError) {
      e.log()
    } else {
      error(`插件 ${pn} 导入过程中发生错误: \n${JSON.stringify(e, null, 2)}`)
    }
  }

  plugins.delete(pluginName)

  return false
}
