import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import ncu from 'npm-check-updates'
import path from 'node:path'

import { CWD, AnemoLogger } from '@src/core'

/** 更新依赖 */
export async function update(pkg = '') {
  const promiseExec = promisify(exec)

  const upInfo = await ncu({
    packageFile: path.join(CWD, 'package.json'),
    filter: pkg || ['@anemo/*', 'anemo', 'anemo-*'],
    upgrade: true,
    jsonUpgraded: true,
    registry: 'https://registry.npmmirror.com'
  })

  const npmUpCmd = `npm up ${pkg} --registry=https://registry.npmmirror.com`

  try {
    const { stderr } = await promiseExec(npmUpCmd)

    if (stderr) {
      if (/npm ERR/i.test(String(stderr))) {
        return false
      }
    }

    return upInfo
  } catch (e) {
    AnemoLogger.error(JSON.stringify(e, null, 2))

    return false
  }
}
