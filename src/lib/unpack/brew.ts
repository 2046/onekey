import decompress from 'decompress'
import { execute, exec, which } from '../utils'

export default {
  installer: async function (filePath: string, dest: string) {
    try {
      const binPath = `/usr/local/bin/brew`

      await execute(`mkdir -p ${dest} && chmod 777 ${dest}`)
      await decompress(filePath, dest, { strip: 1 })
      await execute(`ln -s ${dest}/bin/brew ${binPath}`)

      return binPath
    } catch (error) {
      throw (<NodeJS.ErrnoException>error).code === 'EEXIST' ? new Error('file already exists') : error
    }
  },
  install: function (filePath: string) {
    const name = getAppName(filePath)

    if (!which('brew')) {
      throw new Error('To download the application from Homebrew, you need to install brew first.')
    }

    if (isAlready(name)) {
      return which(name)
    }

    const { stdout = '', stderr, code } = exec(filePath)

    if (code === 0 && stdout !== '') {
      return which(name)
    } else {
      throw new Error(stderr)
    }
  }
}

function getAppName(filePath: string) {
  return filePath.replace('brew install', '').trim()
}

function isAlready(name: string) {
  const { code } = exec(`brew list ${name}`)

  return code === 0
}
