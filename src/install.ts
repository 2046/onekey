import AdmZip from 'adm-zip'
import decompress from 'decompress'
import { extname, join } from 'path'
import { appdir, isMac } from './utils'

export default async function install(filePath: string) {
  const extName = extname(filePath)

  if (extName === '.zip') {
    return await unzip(filePath, appdir())
  } else {
    return ''
  }
}

async function unzip(filePath: string, dest: string) {
  let fileName = ''
  const zip = new AdmZip(filePath)

  if (isMac) {
    const entry = zip.getEntries().filter((entry) => /\.app\/?$/.test(entry.entryName))[0]

    if (entry) {
      try {
        await decompress(filePath, dest)
      } catch (error) {
        if ((<NodeJS.ErrnoException>error).code === 'EEXIST') {
          throw new Error('file already exists')
        } else {
          throw error
        }
      }

      fileName = entry.entryName.replace('/', '')
    }
  }

  return fileName ? join(dest, fileName) : ''
}
