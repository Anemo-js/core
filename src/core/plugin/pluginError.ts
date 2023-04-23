import log4js from 'log4js'

import { colors } from '@src/utils'

/** Anemo 插件错误类 */
export class AnemoPluginError extends Error {
  name = 'AnemoPluginError'
  pluginName: string
  message: string

  constructor(name: string, message?: string) {
    super()
    this.pluginName = name
    this.message = message ?? ''
  }

  log() {
    const logger = log4js.getLogger('plugin')
    logger.error(`插件 ${colors.cyan(this.pluginName)} 抛出错误: ${this.message}`)
  }
}
