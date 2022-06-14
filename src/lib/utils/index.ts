import os from 'os'
import * as pkgutil from './pkgutil'
import { extname, join } from 'path'
import { cp, exec, which } from './shell'
import { mkdtemp, lstat } from 'fs/promises'
import { MAS_PKG_URL, isAppleCPU } from './constants'

export { pkgutil }
export { cp, exec, which }
export { MAS_PKG_URL, isAppleCPU }

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
    return (await lstat(join(appdir(), `${appName}.app`))).isDirectory()
  } catch (error) {
    return which(appName.toLowerCase())
  }
}
