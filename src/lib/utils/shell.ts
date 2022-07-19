import shelljs from 'shelljs'
import sudo from 'sudo-prompt'

export function cp(source: string, dest: string) {
  shelljs.cp('-R', source, dest)

  return dest
}

export function exec(command: string, silent = true) {
  return shelljs.exec(command, { silent })
}

export function execute(command: string) {
  return new Promise<{
    stdout: string | Buffer | undefined
    stderr: string | Buffer | undefined
  }>((resolve, reject) => {
    sudo.exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      resolve({ stdout, stderr })
    })
  })
}

export function which(command: string) {
  const { stdout = '' } = shelljs.which(command) || {}

  return stdout
}
