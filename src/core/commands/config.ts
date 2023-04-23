import { anemoConf, saveAnemoConf } from '@/config'
import { parseUin } from '@src/utils'

import type { Client, MessageRet, Sendable } from 'oicq'

export const ConfigText = `
〓 Anemo 配置 〓
/config detail
/config admin add/rm <qq>
/config notice on/off
/config friend <operation>
/config group <operation>
`.trim()

type Operation = 'refuse' | 'ignore' | 'accept'

const OperationMap = {
  refuse: '拒绝',
  accept: '同意',
  ignore: '忽略'
} as const

export async function handleConfigCommand(
  bot: Client,
  params: string[],
  reply: (content: Sendable, quote?: boolean | undefined) => Promise<MessageRet>
) {
  if (!params.length) {
    await reply(ConfigText)
  }

  const [secondCmd, thirdCmd, value] = params

  if (secondCmd === 'detail') {
    const { friend } = anemoConf.notice

    const subAdmins = anemoConf.admins.slice(1)

    const detail = `
〓 Anemo 详细配置 〓
登录模式: ${anemoConf.login_mode ?? '未知'}
设备锁模式: ${anemoConf.device_mode ?? '未知'}
主管理员: ${anemoConf.admins[0] ?? '未知'}
副管理员: ${subAdmins.length ? subAdmins.join(', ') : '空'}
通知状态: ${anemoConf.notice.enable ? '开启' : '关闭'}
好友申请操作: ${OperationMap[friend.request.action] ?? '未知'}
群聊邀请操作: ${OperationMap[friend.request.action] ?? '未知'}
`.trim()

    return reply(detail)
  }

  const mainAdmin = anemoConf.admins[0]

  if (secondCmd === 'admin') {
    const qq = parseUin(value)

    if (!qq) {
      return reply('〓 目标账号不能为空 〓')
    } else {
      const set = new Set(anemoConf.admins.splice(1))

      if (thirdCmd === 'add') {
        if (set.has(qq) || qq === mainAdmin) {
          return reply('〓 目标账号已是 Bot 管理员 〓')
        }

        set.add(qq)

        anemoConf.admins = [mainAdmin, ...set]

        if (saveAnemoConf()) {
          bot.emit('anemo.admin', { admins: [...anemoConf.admins] })
          return reply('〓 添加成功 〓')
        }
      } else if (thirdCmd === 'rm') {
        if (qq === mainAdmin) {
          return reply('〓 无法删除 Bot 主管理员 〓')
        }

        if (!set.has(qq)) {
          return reply('〓 目标账号不是 Bot 管理员 〓')
        }
        set.delete(qq)

        anemoConf.admins = [mainAdmin, ...set]

        if (saveAnemoConf()) {
          bot.emit('anemo.admin', { admins: [...anemoConf.admins] })

          return reply('〓 删除成功 〓')
        }
      }
    }
  }

  if (secondCmd === 'notice') {
    if (thirdCmd === 'on') {
      anemoConf.notice.enable = true

      if (saveAnemoConf()) {
        reply('〓 事件通知已开启 〓')
      }
    } else if (thirdCmd === 'off') {
      anemoConf.notice.enable = false

      if (saveAnemoConf()) {
        reply('〓 事件通知已关闭 〓')
      }
    }
  }

  if (secondCmd === 'group') {
    if (!['ignore', 'accept', 'refuse'].includes(thirdCmd)) {
      return reply('〓 无效的操作 〓')
    }

    anemoConf.notice.group.request.action = thirdCmd as Operation

    if (saveAnemoConf()) {
      reply(`〓 已设置自动${OperationMap[thirdCmd as Operation]}群聊邀请 〓`)
    }
  }

  if (secondCmd === 'friend') {
    if (!['ignore', 'accept', 'refuse'].includes(thirdCmd)) {
      return reply('〓 无效的操作 〓')
    }

    anemoConf.notice.friend.request.action = thirdCmd as Operation

    if (saveAnemoConf()) {
      reply(`〓 已设置自动${OperationMap[thirdCmd as Operation]}好友申请 〓`)
    }
  }
}
