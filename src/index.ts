import chalk from 'chalk'
import { isPackFile, loadFile, parse } from './utils'

const [filePath = '', password = ''] = process.argv.slice(2)

if (!isPackFile(filePath)) {
  console.error(chalk.red('The file format is incorrect, please use the .pack file format.'))
  process.exit(1)
}

;(async function () {
  try {
    const text = await loadFile(filePath)

    console.log(parse(text), password)
  } catch (error) {
    console.info(error)
  }
})()
