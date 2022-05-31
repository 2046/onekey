import axios from 'axios'
import yaml from 'js-yaml'
import { extname } from 'path'
import { IGist } from './types'
import { lstatSync, readFile } from 'fs'

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

export async function loadFile(filePath: string) {
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

      axios
        .get<Array<IGist>>(`https://api.github.com/users/${userName}/gists`)
        .then(({ data }) => getGistRawUrl(data, gistName))
        .then(async (url) => resolve(await loadFile(url)))
        .catch((error) => reject(error))
    } else {
      resolve('')
    }
  })
}

export function parse(text: string) {
  return text ? yaml.load(text) : {}
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
