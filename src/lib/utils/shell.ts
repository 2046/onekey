import shelljs from 'shelljs'

export function cp(source: string, dest: string) {
  shelljs.cp('-R', source, dest)

  return dest
}

export function exec(command: string, silent = true) {
  return shelljs.exec(command, { silent })
}

export function which(command: string) {
  const { stdout } = shelljs.which(command) || {}

  return !!stdout
}
