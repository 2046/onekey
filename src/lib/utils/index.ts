import os from 'os'
import * as pkgutil from './pkgutil'
import { extname, join } from 'path'
import { mkdtemp, lstat } from 'fs/promises'
import { cp, exec, which, execute } from './shell'
import { MAS_PKG_URL, isAppleCPU, Homebrew_DIR, APP_DIR } from './constants'

export { pkgutil }
export { cp, exec, which, execute }
export { MAS_PKG_URL, isAppleCPU, Homebrew_DIR, APP_DIR }

interface IMemoize<T extends () => ReturnType<T>> {
  (func: T, ...args: Parameters<T>): ReturnType<T>
  hash: Map<T, ReturnType<T>>
}

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

export function isBrewUrl(url: string) {
  return url.slice(0, 4).toLowerCase() === 'brew'
}

export async function tmpdir() {
  return await mkdtemp(join(os.tmpdir(), 'download'))
}

export async function isInstalled(appName: string) {
  try {
    const filePath = join(APP_DIR, `${appName}.app`)

    return (await lstat(filePath)).isDirectory() ? filePath : ''
  } catch (error) {
    appName = appName.toLowerCase()

    if (appName === 'git') {
      return whichGit()
    } else if (appName === 'brew') {
      return whichBrew()
    } else {
      return which(appName)
    }
  }
}

function whichBrew() {
  if (which('brew')) {
    return which('brew')
  } else if (which(`${Homebrew_DIR}/bin/brew`)) {
    return which(`${Homebrew_DIR}/bin/brew`)
  } else {
    return ''
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

export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, ...args: Parameters<T>): ReturnType<T> {
  const cache: IMemoize<T> = memoize as unknown as IMemoize<T>

  if (!cache.hash) {
    cache.hash = new Map()
  }

  if (!cache.hash.has(func)) {
    cache.hash.set(func, func(...args))
  }

  return cache.hash.get(func) as ReturnType<T>
}
