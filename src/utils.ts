import os from 'os'
import axios from 'axios'
import yaml from 'js-yaml'
import crypto from 'crypto'
import { extname, join } from 'path'
import { mkdtemp } from 'fs/promises'
import { lstatSync, readFile } from 'fs'
import { IGist, IPackOpition } from './types'

export function isRootUser() {
  return !(process.platform === 'win32' || process.getuid())
}

export function isHashCode(text: string) {
  return new RegExp(`^[a-f0-9]{${text.length}}$`, 'gi').test(text)
}

export function isPackFile(filePath: string) {
  return extname(filePath) === '.pack'
}

export function isLocallyFile(filePath: string) {
  try {
    return lstatSync(filePath).isFile()
  } catch (error) {
    return false
  }
}

export function isRemotelyFile(filePath: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator

  return !!pattern.test(filePath)
}

export function isGistFile(filePath: string) {
  const names = resolveGist(filePath)

  return !!(names.length === 2 && names[0] && names[1])
}

export function loadFile(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    if (isLocallyFile(filePath)) {
      readFile(filePath, 'utf8', (err, data) => (err ? reject(err) : resolve(data)))
    } else if (isRemotelyFile(filePath)) {
      axios
        .get<string>(filePath)
        .then(({ data }) => resolve(data))
        .catch((error) => reject(error))
    } else if (isGistFile(filePath)) {
      const [userName, gistName] = resolveGist(filePath)
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

export function parse<T = never>(text: string): T {
  return (text ? yaml.load(text) : {}) as T
}

export function toInt(text: string) {
  return text ? parseInt(text, 10) : 0
}

export function encrypt(data: string, password: string) {
  const algorithm = 'aes-256-cbc'
  const iv = crypto.createHash('md5').update(password).digest()
  const key = crypto.createHash('sha256').update(password).digest()
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encryptedData = cipher.update(data, 'utf8', 'hex')

  return `${encryptedData}${cipher.final('hex')}`
}

export function decrypt(data: string, password: string) {
  const algorithm = 'aes-256-cbc'
  const iv = crypto.createHash('md5').update(password).digest()
  const key = crypto.createHash('sha256').update(password).digest()
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  const decryptedData = decipher.update(data, 'hex', 'utf8')

  return `${decryptedData}${decipher.final('utf8')}`
}

export async function tmpdir() {
  return await mkdtemp(join(os.tmpdir(), 'download'))
}

export function isAppType(obj: IPackOpition) {
  return obj.type === 'app'
}

export function isCommandType(obj: IPackOpition) {
  return obj.type === 'command'
}

export function isAppleCPU() {
  return os.cpus()[0].model.includes('Apple')
}

function resolveGist(filePath: string) {
  return filePath.split('/')
}

function getGistRawUrl(gists: Array<IGist>, name: string) {
  for (const gist of gists) {
    if (gist.files && gist.files[name]) {
      return gist.files[name].raw_url
    }
  }

  return ''
}
