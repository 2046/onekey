import axios from 'axios'
import yaml from 'js-yaml'
import crypto from 'crypto'
import { extname, basename } from 'path'
import { lstatSync, readFile } from 'fs'
import { IGist, IPackOpition } from './typing'

export function parse<T = never>(text: string): T {
  try {
    return (text ? yaml.load(text) : {}) as T
  } catch (error) {
    return {} as T
  }
}

export function isPackFile(filePath: string) {
  return extname(filePath) === '.pack'
}

export function isAppType(obj: IPackOpition) {
  return obj.type === 'app'
}

export function isCommandType(obj: IPackOpition) {
  return obj.type === 'command'
}

export function isMasUrl(url: string) {
  try {
    return new URL(url).hostname === 'apps.apple.com'
  } catch (error) {
    return false
  }
}

export function isHashCode(text: string) {
  return new RegExp(`^[a-f0-9]{${text.length}}$`, 'gi').test(text)
}

export function isGistFile(filePath: string) {
  return /^[a-z0-9]+\/[a-z0-9]+$/gi.test(filePath)
}

export function isLocallyFile(filePath: string) {
  try {
    return lstatSync(filePath).isFile()
  } catch (error) {
    return false
  }
}

export function isRemotelyFile(filePath: string) {
  try {
    return ['http:', 'https:'].includes(new URL(filePath).protocol)
  } catch (error) {
    return false
  }
}

export function loadFile(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    if (isLocallyFile(filePath)) {
      readFile(filePath, 'utf8', (err, data) => (err ? reject(err) : resolve(data.trim())))
    } else if (isRemotelyFile(filePath)) {
      axios
        .get<string>(filePath)
        .then(({ data }) => resolve(data.trim()))
        .catch((error) => reject(error))
    } else if (isGistFile(filePath)) {
      const [userName, gistName] = filePath.split('/')
      const url = `https://api.github.com/users/${userName}/gists`

      axios
        .get<Array<IGist>>(url)
        .then(({ data }) => getGistRawUrl(data, gistName))
        .then(async (url) => resolve(await loadFile(url)))
        .catch((error) => reject(error))
    } else {
      reject(new Error('The file not found'))
    }
  })
}

export function resolveMasUrl(url: string) {
  try {
    const str = basename(new URL(url).pathname)
    return str.indexOf('id') === 0 ? str.replace('id', '') : ''
  } catch (error) {
    return ''
  }
}

export function encrypt(data: string, password: string) {
  const algorithm = 'aes-256-cbc'
  const iv = crypto.createHash('md5').update(password).digest()
  const key = crypto.createHash('sha256').update(password).digest()
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  return `${cipher.update(data, 'utf8', 'hex')}${cipher.final('hex')}`
}

export function decrypt(data: string, password: string) {
  const algorithm = 'aes-256-cbc'
  const iv = crypto.createHash('md5').update(password).digest()
  const key = crypto.createHash('sha256').update(password).digest()
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  return `${decipher.update(data, 'hex', 'utf8')}${decipher.final('utf8')}`
}

function getGistRawUrl(gists: Array<IGist>, name: string) {
  for (const gist of gists) {
    if (gist.files && gist.files[name]) {
      return gist.files[name].raw_url
    }
  }

  return ''
}
