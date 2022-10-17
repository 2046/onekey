import unpkg from './pkg'
import { join } from 'path'
import download from '../donwload'
import { exec, which, tmpdir, MAS_PKG_URL, APP_DIR, isAppleCPU, pkgutil } from '../utils'

export default async function unmas(appid: string, dest: string) {
  if (!isLogined()) {
    throw new Error('To download apps from the Mac App Store, you need to login to your Apple ID manually.')
  }

  if (!which('mas')) {
    await installMas()
  }

  let appName = ''
  const { stdout, stderr } = exec(`mas install ${appid}`)

  if (stderr) {
    appName = stderr.replace('Warning: ', '').replace(' is already installed', '').trim()
  } else if (stdout) {
    appName = stdout.replace('==> Installed', '').trim()
  }

  return appName ? join(dest, `${appName}.app`) : ''
}

function isLogined() {
  const { stdout } = exec('defaults read MobileMeAccounts | grep AccountID | cut -d \\" -f2')

  return !!stdout
}

async function installMas() {
  const filePath = await download({
    url: MAS_PKG_URL,
    dir: await tmpdir()
  })

  if (isAppleCPU && !isInstallRosetta()) {
    installRosetta2()
  }

  await unpkg(filePath, APP_DIR)
}

function isInstallRosetta() {
  return Object.keys(pkgutil.pkgInfo('com.apple.pkg.RosettaUpdateAuto')).length > 0
}

function installRosetta2() {
  exec('softwareupdate --install-rosetta --agree-to-license')
}
