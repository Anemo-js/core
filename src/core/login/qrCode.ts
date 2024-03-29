import { AnemoLogger } from '@/logger'

import type { Client } from 'oicq'

/** 处理二维码扫描，自动轮询登录 */
export function qrCodeHandler(this: Client) {
  let hasShowReadMessage = false

  // 扫码轮询
  const interval_id = setInterval(async () => {
    const { retcode, uin } = await this.queryQrcodeResult()

    if (retcode === 53 && !hasShowReadMessage) {
      AnemoLogger.info(`二维码扫描成功，正在等待确认...`)
      hasShowReadMessage = true
      return
    }

    if (retcode === 54) {
      AnemoLogger.warn('扫码验证被用户手动取消')
      AnemoLogger.warn('你可以按 `Enter` 键重新获取二维码，或者退出框架')

      clearInterval(interval_id)

      process.stdin.once('data', () => this.login())
    }

    if (retcode === 17) {
      AnemoLogger.warn('二维码已失效，正在重新获取...')
      clearInterval(interval_id)
      this.login()
    }

    // 0: 扫码成功 48: 未过期，等待扫码 53: 已扫码未确认 54: 扫码后被手动取消 17: 二维码过期
    if (retcode === 0) {
      clearInterval(interval_id)

      if (uin === this.uin) {
        AnemoLogger.info(`Bot 帐号 ${uin} 扫码验证成功`)
        this.login()
        return
      }

      AnemoLogger.warn('扫码账号错误，扫码账号与配置账号不一致，请使用 Bot 账号扫码')
      AnemoLogger.warn('请在准备好扫码后，按 `Enter` 键重新获取二维码')

      process.stdin.once('data', () => this.login())
    }
  }, 1000)

  AnemoLogger.info(`等待 Bot 账号 ${this.uin} 扫描二维码...`)
}
