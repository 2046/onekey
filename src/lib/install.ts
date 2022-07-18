import undmg from './unpack/dmg'
import unzip from './unpack/zip'
import unpkg from './unpack/pkg'
import unmas from './unpack/mas'
import brew from './unpack/brew'
import { extName } from './utils'

interface IInstallOptions {
  dest: string
  appName: string
  filePath: string
}

export default async function install(options: IInstallOptions) {
  const ext = extName(options.filePath)

  if (options.appName.toLowerCase() === 'brew') {
    return await brew(options.filePath, options.dest)
  }

  if (ext === '.zip') {
    return await unzip(options.filePath, options.dest)
  } else if (ext === '.dmg') {
    return await undmg(options.filePath, options.dest)
  } else if (ext === '.pkg') {
    return await unpkg(options.filePath, options.dest)
  } else if (ext === '.mas') {
    return await unmas(options.filePath, options.dest)
  } else {
    return ''
  }
}
