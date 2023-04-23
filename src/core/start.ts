import path from 'node:path'
import { createClient } from 'oicq'
import crypto from 'node:crypto'
import fs, { ensureDirSync } from 'fs-extra'

import { colors, LOGO, title, exitWithError, notice } from '@src/utils'
import { ConfigPath, configFile, LogDir, OicqDataDir, PluginDataDir, PluginDir } from './path'
import { deviceHandler, errorHandler, qrCodeHandler, sliderHandler } from './login'
import { Devices, AnemoLogger, redirectLog } from './logger'
import { anemoConf } from './config'
import { offlineHandler } from './logs'
import { onlineHandler } from './online'

import type { AnemoPlugin } from './plugin'
import type { AnemoConf } from './config'

export const plugins: Map<string, AnemoPlugin> = new Map()

export const pkg = require(path.join(__dirname, '../../package.json'))

/** 启动框架 */
export const start = () => {
  // 设置终端标题
  process.title = `Anemo ${pkg?.version ?? '未知'} `

  // 打印 Anemo logo
  console.log(`\n${colors.cyan(LOGO)}\n`)

  if (!fs.existsSync(ConfigPath)) {
    exitWithError(`配置文件 ${configFile} 不存在`)
  }

  /** 捕获 Ctrl C 中断退出 */
  process.on('SIGINT', () => {
    notice.success(colors.yellow('已退出 Anemo'), true)
    process.exit(0)
  })

  try {
    // 读取框架账号配置文件 `bot.json`
    const conf: AnemoConf = require(ConfigPath)

    // 载入配置到内存
    Object.assign(anemoConf, conf)

    // 终端标题加上账号
    process.title = `Anemo ${pkg.version} ${anemoConf.account}`

    console.log(title)
    console.log('使用文档: ' + colors.green('https://anemo-docs.pages.dev/'))
    console.log('框架版本: ' + colors.green(`anemo-core ${pkg.version}`))
    console.log('配置文件: ' + colors.green(`${ConfigPath}\n`))

    const { log_level = 'info', oicq_config = {} } = anemoConf

    if (!anemoConf?.account) {
      exitWithError(`无效的配置文件：${configFile}`)
    }

    if (!anemoConf?.admins || anemoConf?.admins?.length <= 0) {
      exitWithError(`配置文件 ${configFile} 中至少配置一个主管理员`)
    }

    // 缺省 oicq 配置

    // 未指定协议时，默认使用 iPad 协议作为 oicq 登录协议
    oicq_config.platform = oicq_config?.platform ?? 5
    // ociq 数据及缓存保存在 data/oicq 下
    oicq_config.data_dir = OicqDataDir
    // oicq 默认日志等级为 info
    oicq_config.log_level = oicq_config?.log_level ?? 'info'
    // 指定默认 ffmpeg 和 ffprobe 命令为全局路径
    oicq_config.ffmpeg_path = oicq_config?.ffmpeg_path ?? 'ffmpeg'
    oicq_config.ffprobe_path = oicq_config?.ffprobe_path ?? 'ffprobe'

    // 重定向日志，oicq 的日志输出到日志文件，Anemo 的日志输出到 console
    redirectLog(log_level, oicq_config, anemoConf.account)

    // 确保 Anemo 框架相关目录存在
    ensureDirSync(LogDir)
    ensureDirSync(PluginDir)
    ensureDirSync(PluginDataDir)

    const protocol = Devices[oicq_config.platform] || '未知'

    AnemoLogger.info(colors.gray(`使用 ${protocol} 作为 Bot 登录协议`))
    AnemoLogger.info(colors.gray(`开始登录 Bot ${anemoConf.account}`))
    AnemoLogger.info(colors.gray(`正在查找可用服务器...`))

    // 初始化实例
    const bot = createClient(anemoConf.account, oicq_config)

    // 取消监听函数个数限制
    bot.setMaxListeners(Infinity)

    // 监听上线事件
    bot.on('system.online', onlineHandler.bind(bot, anemoConf))

    // 监听设备锁、滑块和登录错误的事件
    bot.on('system.login.device', deviceHandler.bind(bot, conf.device_mode))
    bot.on('system.login.slider', ({ url }) => sliderHandler.call(bot, { isFirst: true, url }))
    bot.on('system.login.error', errorHandler)

    // 监听下线事件
    bot.on('system.offline', offlineHandler)

    // 通过配置文件里指定的模式登录账号
    if (conf.login_mode === 'qrcode') {
      bot.on('system.login.qrcode', qrCodeHandler).login()
    } else {
      const plainPwd = Buffer.from(conf.password || '', 'base64').toString()
      const md5Pwd = crypto.createHash('md5').update(plainPwd).digest()
      bot.login(md5Pwd)
    }
  } catch (e) {
    AnemoLogger.error(JSON.stringify(e, null, 2))
    exitWithError(`无效的配置文件：${configFile} `)
  }
}
