import { colors } from '@src/utils'
import { getPluginNameByPath } from './getPluginNameByPath'
import { killPlugin } from './killPlugin'
import { AnemoLogger } from '@/logger'
import { AnemoPluginError } from './pluginError'

import type { Client } from 'oicq'
import type { AnemoConf } from '@/config'
import type { AnemoPlugin } from './plugin'

/** 通过插件路径禁用单个插件  */
export async function disablePlugin(
  bot: Client,
  anemoConf: AnemoConf,
  plugin: AnemoPlugin,
  pluginPath: string
) {
  const error = (msg: any, ...args: any[]) => {
    bot.logger.error(msg, ...args)
    AnemoLogger.error(msg, ...args)
  }

  const info = (msg: any, ...args: any[]) => {
    bot.logger.info(msg, ...args)
    AnemoLogger.info(msg, ...args)
  }

  AnemoLogger.debug('disablePlugin: ' + pluginPath)

  const pluginName = getPluginNameByPath(pluginPath)
  const pn = colors.green(pluginName)

  try {
    // 调用插件挂载的禁用函数
    await plugin.unmountAnemoClient(bot, [...anemoConf.admins])

    // 删除 require 缓存
    killPlugin(pluginPath)

    info(`插件 ${pn} 禁用成功`)

    return true
  } catch (e) {
    if (e instanceof AnemoPluginError) {
      e.log()
    } else {
      error(`插件 ${pn} 禁用过程中发生错误: \n${JSON.stringify(e, null, 2)}`)
    }
  }

  return false
}
