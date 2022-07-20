import decompress from 'decompress'
import { execute } from '../utils'

export default async function brew(filePath: string, dest: string) {
  try {
    const binPath = `/usr/local/bin/brew`

    await execute(`mkdir -p ${dest} && chmod 777 ${dest}`)
    await decompress(filePath, dest, { strip: 1 })
    await execute(`ln -s ${dest}/bin/brew ${binPath}`)

    return binPath
  } catch (error) {
    throw (<NodeJS.ErrnoException>error).code === 'EEXIST' ? new Error('file already exists') : error
  }
}
