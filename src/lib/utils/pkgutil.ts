import plist from 'plist'
import { exec, execute } from './shell'

export type IPlist = {
  pkgid: string
  volume: string
  'pkg-version': string
  'install-time': number
  'install-location': string
  'receipt-plist-version': number
}

export function pkgs() {
  const { stdout } = exec('pkgutil --pkgs-plist')

  return <Array<string>>plist.parse(stdout.trim())
}

export function pkgInfo(pkgid: string) {
  const { stdout } = exec(`pkgutil --pkg-info-plist ${pkgid}`)

  return <IPlist>plist.parse(stdout.trim())
}

export function files(pkgid: string) {
  const { stdout } = exec(`pkgutil --files ${pkgid} --only-files`)
  return stdout.trim().split('\n')
}

export function installer(pathToPackage: string, mountPoint: string) {
  return execute(`installer -pkg ${convertSpaces(pathToPackage)} -target ${mountPoint}`)
}

function convertSpaces(filePath: string) {
  return filePath.replace(/ /g, '\\ ')
}
