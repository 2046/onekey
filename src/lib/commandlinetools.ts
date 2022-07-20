import { exec, memoize } from './utils'

export default {
  isInstalled() {
    const { code } = exec('xcode-select -p')

    return code === 0
  },
  download() {
    exec('touch /tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress')
    exec(`softwareupdate -d "${memoize(getLabel)}"`)
  },
  install() {
    exec(`softwareupdate -i "${memoize(getLabel)}"`)
  }
}

function getLabel() {
  const { stdout, code } = exec('softwareupdate -l | grep "*.*Command Line" | head -n 1')

  return code ? '' : stdout.replace('* Label: ', '').trim()
}
