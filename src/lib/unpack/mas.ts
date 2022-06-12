import unpkg from './pkg'
import { join } from 'path'
import download from '../donwload'
import { exec, which, tmpdir, MAS_PKG_URL, appdir } from '../utils'

export default async function unmas(appid: string, dest: string) {
  if (isLogined()) {
    throw new Error('To download apps from the Mac App Store, you need to login to your Apple ID manually.')
  }

  if (!which('mas')) {
    await installMas()
  }

  const { stdout } = exec(`mas install ${appid}`)
  const appName = stdout ? stdout.replace('==> Installed', '') : ''

  return appName ? join(dest, appName, '.app') : ''
}

function isLogined() {
  const { stdout } = exec("defaults read MobileMeAccounts | grep AccountID | cut -d '\"' -f 2")

  return !!stdout
}

async function installMas() {
  const filePath = await download({
    url: MAS_PKG_URL,
    dir: await tmpdir()
  })

  await unpkg(filePath, appdir())
}
