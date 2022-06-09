import AdmZip from 'adm-zip'
import shelljs from 'shelljs'
import pkgutil from './pkgutil'
import decompress from 'decompress'
import { readdir } from 'fs/promises'
import { appdir, isMac } from './utils'
import { Mounter } from '@shockpkg/hdi-mac'
import { extname, join, basename } from 'path'

export default async function install(filePath: string) {
  const extName = extname(filePath)

  if (extName === '.zip') {
    return await unzip(filePath, appdir())
  } else if (extName === '.dmg') {
    return await undmg(filePath, appdir())
  } else {
    return ''
  }
}

async function unzip(filePath: string, dest: string) {
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

async function undmg(filePath: string, dest: string) {
  let destPath = ''
  const mounter = new Mounter()
  const diskImage = await mounter.attach(filePath, { nobrowse: true })
  const { mountPoint } = diskImage.devices.find((device) => device.mountPoint) || {}

  if (!mountPoint) {
    throw new Error('The mountPoint not found')
  }

  for (const file of await getMatchFiles(mountPoint)) {
    const extName = extname(file)
    const sourcePath = join(mountPoint, file)

    if (extName === '.app') {
      destPath = join(dest, file)
      shelljs.cp('-R', sourcePath, destPath)
    } else if (extName === '.pkg') {
      destPath = unpkg(sourcePath, dest)
    }
  }

  await diskImage.eject()

  return destPath
}

function unpkg(filePath: string, dest: string) {
  const snapshot = pkgutil.pkgs()

  pkgutil.installer(filePath, dest)

  return getCurrentPkgs(snapshot, pkgutil.pkgs(), dest.replace('/', ''))
}

function isApp(file: string) {
  return /\.app?$/.test(file)
}

function isPkg(file: string) {
  return /\.pkg?$/.test(file)
}

function getCurrentPkgs(previousValue: Array<string>, currentValue: Array<string>, dest: string) {
  const pkgIds = currentValue.filter((value) => !previousValue.includes(value))
  const pkgInfos = pkgIds.map((pkgid) => pkgutil.pkgInfo(pkgid))

  if (pkgInfos.map((info) => info['install-location']).includes(dest)) {
    const pkgInfo = pkgInfos.find((info) => info['install-location'] === dest)
    const pkgFiles = pkgInfo ? pkgutil.files(pkgInfo.pkgid) : []

    return pkgFiles.filter((fileName) => /^[^/]+$/.test(fileName))[0]
  } else {
    return join('/usr/local/bin', pkgInfos.map((info) => basename(pkgutil.files(info.pkgid)[0]))[0])
  }
}

async function getMatchFiles(mountPoint: string) {
  const files = await readdir(mountPoint)

  return files.filter((file) => isApp(file) || isPkg(file))
}
