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

    return appName === 'git' ? whichGit() : which(appName)
  }
}

function whichGit() {
  const { code, stdout } = exec('git version')

  if (code !== 0 || stdout.indexOf('Apple') !== -1) {
    return ''
  } else {
    return which('git')
  }
}

interface IMemoize<T extends () => ReturnType<T>> {
  (func: T, ...args: Parameters<T>): ReturnType<T>
  hash: Map<T, ReturnType<T>>
}

export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, ...args: Parameters<T>): ReturnType<T> {
  const cache: IMemoize<T> = memoize as unknown as IMemoize<T>

  if (cache.hash) {
    cache.hash = new Map()
  }

  if (!cache.hash.has(func)) {
    cache.hash.set(func, func(...args))
  }

  return cache.hash.get(func) as ReturnType<T>
}
