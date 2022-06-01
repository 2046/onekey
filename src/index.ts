import chalk from 'chalk'
import { isPackFile, loadFile, parse, decrypt } from './utils'

const [filePath = '', password = ''] = process.argv.slice(2)

if (!isPackFile(filePath)) {
  console.error(chalk.red('The file format is incorrect, please use the .pack file format.'))
  process.exit(1)
}

;(async function () {
  try {
    let text = await loadFile(filePath)

    if (password) {
      text = decrypt(text, password)
    }

    console.log(parse(text))
  } catch (error) {
    console.info(error)
  }
})()
