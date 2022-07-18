import os from 'os'
import * as pkgutil from './pkgutil'
import { extname, join } from 'path'
import { mkdtemp, lstat } from 'fs/promises'
import { cp, exec, which, execute } from './shell'
import { MAS_PKG_URL, isAppleCPU, Homebrew_DIR } from './constants'

export { pkgutil }
export { cp, exec, which, execute }
export { MAS_PKG_URL, isAppleCPU, Homebrew_DIR }

export function toInt(text: string) {
  return text ? parseInt(text, 10) : 0
}

export function extName(filePath: string) {
  const ext = extname(filePath)

  if (ext) {
    return ext
  } else if (/^\d+$/.test(filePath)) {
    return '.mas'
  } else {
    return ''
  }
}

export function appdir() {
  return '/Applications'
}

export async function tmpdir() {
  return await mkdtemp(join(os.tmpdir(), 'download'))
}

export async function isInstalled(appName: string) {
  try {
    const filePath = join(appdir(), `${appName}.app`)

    return (await lstat(filePath)).isDirectory() ? filePath : ''
  } catch (error) {
    appName = appName.toLowerCase()

    return which(appName) ? `/usr/local/bin/${appName}` : ''
  }
}
