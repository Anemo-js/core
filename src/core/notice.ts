import { segment } from 'oicq'

import { anemoConf } from './config'
import { formatDateDiff, getGroupAvatarLink, getQQAvatarLink } from '@src/utils'

import type { Client, ImageElem } from 'oicq'

function buildNotice(title: string, avatar: ImageElem, content: string) {
  return [avatar, `\n〓 ${title} 〓`, `\n${content}`]
}

/** 处理消息通知 */
export function configNotice(bot: Client) {
  const { notice, admins } = anemoConf
  const { friend, group } = notice

  const mainAdmin = bot.pickUser(admins[0])

  // 好友私聊
  bot.on('message.private', (event) => {
    if (!anemoConf.notice.enable || !friend.message) return

    const {
      sender: { user_id, nickname },
      message
    } = event

    if (user_id === admins[0]) return

    const avatar = segment.image(getQQAvatarLink(user_id, 100))

    const msg = `
昵称: ${nickname || '未知'}
QQ: ${user_id || '未知'}
〓 消息内容 〓\n`.trimStart()
    mainAdmin.sendMsg([...buildNotice('私聊消息', avatar, msg), ...message])
  })

  // 好友申请
  bot.on('request.friend.add', async (event) => {
    if (friend.request.action !== 'ignore') {
      const action = friend.request.action === 'accept'
      await event.approve(action)
    }

    if (!anemoConf.notice.enable || !friend.request.enable) return

    const { user_id, nickname, comment, source } = event
    const avatar = segment.image(getQQAvatarLink(user_id, 100))

    const msg = `
昵称: ${nickname || '未知'}
QQ: ${user_id || '未知'}
来源: ${source}
附加信息: ${comment}
操作: ${[friend.request.action]}
`.trim()

    mainAdmin.sendMsg(buildNotice('好友申请', avatar, msg))
  })

  // 新增好友
  bot.on('notice.friend.increase', async (event) => {
    if (!anemoConf.notice.enable || !friend.increase) return

    const { nickname, user_id } = event
    const avatar = segment.image(getQQAvatarLink(user_id, 100))

    const msg = `
昵称: ${nickname || '未知'}
QQ: ${user_id || '未知'}
`.trim()

    mainAdmin.sendMsg(buildNotice('新增好友', avatar, msg))
  })

  // 好友减少
  bot.on('notice.friend.decrease', async (event) => {
    if (!anemoConf.notice.enable || !friend.decrease) return

    const { nickname, user_id } = event
    const avatar = segment.image(getQQAvatarLink(user_id, 100))

    const msg = `
昵称: ${nickname || '未知'}
QQ: ${user_id || '未知'}
  `.trim()

    mainAdmin.sendMsg(buildNotice('好友减少', avatar, msg))
  })

  // 邀请 Bot 进群
  bot.on('request.group.invite', async (event) => {
    if (group.request.action !== 'ignore') {
      const action = group.request.action === 'accept'
      await event.approve(action)
    }

    if (!anemoConf.notice.enable || !friend.request.enable) return

    const { user_id, nickname, group_id, group_name, role } = event
    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
目标群聊: ${group_name || '未知'}
目标群号: ${group_id || '未知'}
邀请人: ${nickname || '未知'}(${user_id || '未知'}, ${role})
操作: ${group.request.action}
`.trim()

    mainAdmin.sendMsg(buildNotice('邀请进群', avatar, msg))
  })

  // 新增群聊
  bot.on('notice.group.increase', async (event) => {
    if (!anemoConf.notice.enable || !group.increase) return

    const {
      user_id,
      group: { group_id, name }
    } = event

    if (user_id !== bot.uin) return

    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
群名: ${name || '未知'}
群号: ${group_id || '未知'}
`.trim()

    mainAdmin.sendMsg(buildNotice('新增群聊', avatar, msg))
  })

  // 群聊减少
  bot.on('notice.group.decrease', async (event) => {
    if (!anemoConf.notice.enable || !group.decrease) return

    const {
      user_id,
      operator_id,
      group: { group_id, name }
    } = event

    if (user_id !== bot.uin) return

    const isKick = operator_id !== bot.uin
    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
群名: ${name || '未知'}
群号: ${group_id || '未知'}
${isKick ? `操作人: ${operator_id || '未知'}` : ''}
`.trim()

    mainAdmin.sendMsg(buildNotice(isKick ? 'Bot 被踢' : 'Bot 退群', avatar, msg))
  })

  // 群管理变动
  bot.on('notice.group.admin', async (event) => {
    if (!anemoConf.notice.enable || !group.admin) return

    const {
      user_id,
      set,
      group: { group_id, name }
    } = event

    if (user_id !== bot.uin) return

    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
群名: ${name || '未知'}
群号: ${group_id || '未知'}
被操作人: ${user_id || '未知'}
`.trim()

    mainAdmin.sendMsg(buildNotice(set ? '设置群管理' : '取消群管理', avatar, msg))
  })

  // Bot 被禁言
  bot.on('notice.group.ban', async (event) => {
    if (!anemoConf.notice.enable || !group.admin) return

    const {
      user_id,
      duration,
      operator_id,
      group: { group_id, name }
    } = event

    if (user_id !== bot.uin) return

    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
群名: ${name || '未知'}
群号: ${group_id || '未知'}
时长: ${formatDateDiff(duration * 1000)}
操作人: ${operator_id || '未知'}
`.trim()

    mainAdmin.sendMsg(buildNotice('Bot 被禁言', avatar, msg))
  })

  // 群转让
  bot.on('notice.group.transfer', async (event) => {
    if (!anemoConf.notice.enable || !group.admin) return

    const {
      user_id,
      operator_id,
      group: { group_id, name }
    } = event

    const avatar = segment.image(getGroupAvatarLink(group_id, 100))

    const msg = `
群名: ${name || '未知'}
群号: ${group_id || '未知'}
原群主: ${operator_id || '未知'}
新群主: ${user_id || '未知'}
`.trim()

    mainAdmin.sendMsg(buildNotice('群聊转让', avatar, msg))
  })
}
