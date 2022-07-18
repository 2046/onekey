import sudo from 'sudo-prompt'
import { exec } from '../utils'
import decompress from 'decompress'

export default async function brew(filePath: string, dest: string) {
  try {
    const binPath = `/usr/local/bin/brew`

    await execCommandWithSudo(`mkdir -p ${dest} && chmod 777 ${dest}`)
    await decompress(filePath, dest, { strip: 1 })

    exec(`ln -s ${dest}/bin/brew ${binPath}`)

    return binPath
  } catch (error) {
    throw (<NodeJS.ErrnoException>error).code === 'EEXIST' ? new Error('file already exists') : error
  }
}

function execCommandWithSudo(command: string) {
  return new Promise((resolve, reject) => {
    sudo.exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      resolve({ stdout, stderr })
    })
  })
}
