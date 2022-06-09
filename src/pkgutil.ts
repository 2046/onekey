import shelljs from 'shelljs'
import { IPlist } from './types'
import { parsePlist } from './utils'

export default {
  pkgs() {
    const { stdout } = shelljs.exec('pkgutil --pkgs-plist', { silent: true })

    return <Array<string>>parsePlist(stdout.trim())
  },
  installer(pathToPackage: string, mountPoint: string) {
    shelljs.exec(`sudo installer -pkg ${convertSpaces(pathToPackage)} -target ${mountPoint}`, { silent: true })
  },
  pkgInfo(pkgid: string) {
    const { stdout } = shelljs.exec(`pkgutil --pkg-info-plist ${pkgid}`, { silent: true })

    return <IPlist>parsePlist(stdout.trim())
  },
  files(pkgid: string) {
    const { stdout } = shelljs.exec(`pkgutil --files ${pkgid} --only-files`, { silent: true })

    return stdout.trim().split('\n')
  }
}

function convertSpaces(filePath: string) {
  return filePath.replace(/ /g, '\\ ')
}
