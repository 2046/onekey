import undmg from './unpack/dmg'
import unzip from './unpack/zip'
import unpkg from './unpack/pkg'
import unmas from './unpack/mas'
import { extName, appdir } from './utils'

export default async function install(filePath: string) {
  const ext = extName(filePath)

  if (ext === '.zip') {
    return await unzip(filePath, appdir())
  } else if (ext === '.dmg') {
    return await undmg(filePath, appdir())
  } else if (ext === '.pkg') {
    return await unpkg(filePath, appdir())
  } else if (ext === '.mas') {
    return await unmas(filePath, appdir())
  } else {
    return ''
  }
}
