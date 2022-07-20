import { pkgutil, which } from '../utils'
import { join, basename } from 'path'

export default async function unpkg(filePath: string, dest: string) {
  const snapshot = pkgutil.pkgs()

  await pkgutil.installer(filePath, dest)

  return getCurrentPkgs(snapshot, pkgutil.pkgs(), dest.replace('/', ''))
}

function getCurrentPkgs(previousValue: Array<string>, currentValue: Array<string>, dest: string) {
  const pkgIds = currentValue.filter((value) => !previousValue.includes(value))
  const pkgInfos = pkgIds.map((pkgid) => pkgutil.pkgInfo(pkgid))

  if (pkgIds.length === 0) {
    throw new Error('file already exists')
  }

  if (pkgInfos.map((info) => info['install-location']).includes(dest)) {
    const pkgInfo = pkgInfos.find((info) => info['install-location'] === dest)
    const pkgFiles = pkgInfo ? pkgutil.files(pkgInfo.pkgid) : []

    return join(dest, pkgFiles.filter((fileName) => /^[^/]+$/.test(fileName))[0])
  } else {
    return which(pkgInfos.map((info) => basename(pkgutil.files(info.pkgid)[0]))[0])
  }
}
