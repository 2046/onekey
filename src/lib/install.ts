import undmg from './unpack/dmg'
import unzip from './unpack/zip'
import unpkg from './unpack/pkg'
import unmas from './unpack/mas'
import { extName } from './utils'

export default async function install(filePath: string, dest: string) {
  const ext = extName(filePath)

  if (ext === '.zip') {
    return await unzip(filePath, dest)
  } else if (ext === '.dmg') {
    return await undmg(filePath, dest)
  } else if (ext === '.pkg') {
    return await unpkg(filePath, dest)
  } else if (ext === '.mas') {
    return await unmas(filePath, dest)
  } else {
    return ''
  }
}
