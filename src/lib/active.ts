import { exec, execute } from './utils'

export default async function active(steps: Array<string>) {
  for (const step of steps) {
    if (isSudoCommand(step)) {
      const { stderr } = await execute(step.replace('sudo', '').trim())

      if (stderr) {
        throw new Error(stderr.toString())
      }
    } else {
      const { code, stderr } = exec(step)

      if (code) {
        throw new Error(stderr)
      }
    }
  }
}

function isSudoCommand(cmd: string) {
  return cmd.slice(0, 4) === 'sudo'
}
