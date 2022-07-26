import { exec } from './utils'

export default function active(steps: Array<string>) {
  for (const step of steps) {
    const { code, stderr } = exec(step)

    if (code) {
      throw new Error(stderr)
    }
  }
}
