import dayjs from 'dayjs'
import log4js from 'log4js'
import path from 'node:path'

import { LogDir } from './path'
import { colors } from '@src/utils'

import type { Config } from 'oicq'

/** 1:安卓手机 2:aPad 3:安卓手表 4:MacOS 5:iPad */
export const Devices = ['', 'Android', 'aPad', 'aWatch', 'Mac', 'iPad'] as const

export const AnemoLogger = log4js.getLogger('anemo')
export const PluginLogger = log4js.getLogger('plugin')

export const LogTypeMap = {
  all: 'gray',
  mark: 'gray',
  trace: 'white',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'magenta',
  off: 'magenta'
} as const

// 添加自定义 log4js Layout 布局：anemo
log4js.addLayout('anemo', (config) => {
  const { qq, platform, target = 'anemo' } = config

  // oicq 日志输出到日志文件（可选关闭） logs/Anemo_YYYY-MM-DD_HH-mm-ss.log
  if (target === 'oicq') {
    return (info) => {
      const now = dayjs(info.startTime).format(`YYYY-MM-DD HH:mm:ss:SSS`)
      return `[${now}] [${info.level.levelStr}] [${qq}-${Devices[platform]}] ${info.data}`
    }
  }

  // Anemo 框架日志输出到控制台（包括插件，可选关闭）
  return (info) => {
    const level = info.level.levelStr.toLowerCase() as keyof typeof LogTypeMap
    const now = dayjs(info.startTime).format(`HH:mm:ss`)
    const color = LogTypeMap[level] as keyof typeof colors
    const type = target === 'anemo' ? qq : 'Plugin'
    const head = colors[color](`[${now}-${type}]`)
    return head + colors.gray(' - ') + info.data
  }
})

/** 重定向 oicq 日志输出到日志文件 */
export function redirectLog(anemoLogLevel = 'info', oicq_config: Config, account: number) {
  const { platform = 5, log_level: oicqLogLevel } = oicq_config

  // 定义输出文件名和路径
  const now = dayjs().format('YYYY-MM-DD_HH-mm-ss')
  const filename = `Anemo_${now}_${account}_${Devices[platform]}`
  const logFilePath = path.join(LogDir, `${filename}.log`)
  const errorFilePath = path.join(LogDir, `${filename}_error.log`)

  // 使用自定义的 Anemo Layout
  const layout = {
    platform,
    type: 'anemo',
    qq: account
  }

  // 配置 log4js
  log4js.configure({
    appenders: {
      anemo: {
        layout,
        type: 'stdout'
      },
      plugin: {
        type: 'stdout',
        layout: {
          ...layout,
          target: 'pluin'
        }
      },
      log_file: {
        type: 'file',
        filename: logFilePath,
        layout: {
          ...layout,
          target: 'oicq'
        }
      },
      _error_file: {
        type: 'file',
        filename: errorFilePath,
        layout: {
          ...layout,
          target: 'oicq'
        }
      },
      error_file: {
        type: 'logLevelFilter',
        appender: '_error_file',
        level: 'warn'
      }
    },
    categories: {
      default: {
        appenders: ['log_file', 'error_file'],
        level: oicqLogLevel as string
      },
      anemo: {
        appenders: ['anemo'],
        level: anemoLogLevel
      },
      plugin: {
        appenders: ['plugin'],
        level: anemoLogLevel
      }
    }
  })
}
