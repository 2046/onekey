import shelljs from 'shelljs'
import install from './install'
import { tmpdir } from './utils'
import download from './download'

export default {
  async install() {
    const filePath = await downloadMas()

    return await install(filePath)
  },
  installApp(appid: string) {
    const { stdout } = shelljs.exec(`mas install ${appid}`, { silent: true })
    return stdout ? stdout.replace('==> Installed', '') : ''
  },
  isInstalled() {
    const { stdout } = shelljs.which('mas') || {}
    return !!stdout
  },
  isLogined() {
    const { stdout } = shelljs.exec("defaults read MobileMeAccounts | grep AccountID | cut -d '\"' -f 2", {
      silent: true
    })
    return !!stdout
  }
}

async function downloadMas() {
  const dir = await tmpdir()
  const url = 'https://github.com/mas-cli/mas/releases/download/v1.8.6/mas.pkg'

  return new Promise<string>((resolve, reject) => {
    download({
      url,
      dir,
      onError: (error) => reject(error),
      onComplete: (filePath) => resolve(filePath)
    })
  })
}
