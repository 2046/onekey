import unpkg from './pkg'
import { cp } from '../utils'
import { extname, join } from 'path'
import { readdir } from 'fs/promises'
import { Mounter } from '@shockpkg/hdi-mac'

export default async function undmg(filePath: string, dest: string) {
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
      destPath = cp(sourcePath, join(dest, file))
    } else if (extName === '.pkg') {
      destPath = await unpkg(sourcePath, dest)
    }
  }

  await diskImage.eject()

  return destPath
}

async function getMatchFiles(mountPoint: string) {
  const files = await readdir(mountPoint)

  return files.filter((file) => /\.app?$/.test(file) || /\.pkg?$/.test(file))
}
