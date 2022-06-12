import chalk from 'chalk'
import { encrypt, decrypt, isPackFile, loadFile } from './utils'

export default {
  async encrypt(filePath: string, password: string) {
    try {
      if (!isPackFile(filePath)) {
        return console.log(chalk.red('The file format is incorrect, please use the .pack file format.'))
      }

      console.log(encrypt(await loadFile(filePath), password))
    } catch (error) {
      console.log(chalk.red(error))
    }
  },
  async decrypt(filePath: string, password: string) {
    try {
      if (!isPackFile(filePath)) {
        return console.log(chalk.red('The file format is incorrect, please use the .pack file format.'))
      }

      console.log(decrypt(await loadFile(filePath), password))
    } catch (error) {
      console.log(chalk.red(error))
    }
  }
}
