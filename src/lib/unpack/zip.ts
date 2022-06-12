import { join } from 'path'
import AdmZip from 'adm-zip'
import { isMac } from '../utils'
import decompress from 'decompress'

export default async function unzip(filePath: string, dest: string) {
  const zip = new AdmZip(filePath)

  if (isMac) {
    const entry = zip.getEntries().filter((entry) => /\.app\/?$/.test(entry.entryName))[0]

    if (entry) {
      try {
        await decompress(filePath, dest)
      } catch (error) {
        throw (<NodeJS.ErrnoException>error).code === 'EEXIST' ? new Error('file already exists') : error
      }

      return join(dest, entry.entryName.replace('/', ''))
    }
  }

  return ''
}
