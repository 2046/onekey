import chalk from 'chalk'
import { basename } from 'path'
import Progress from 'progress'
import download from './download'
import { isPackFile, loadFile, parse, decrypt, tmpdir, createProgressBar } from './utils'

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

    let progressBar: null | Progress = null
    const url = 'https://dl.google.com/chrome/mac/universal/stable/CHFA/googlechrome.dmg'

    download({
      url: url,
      dir: await tmpdir(),
      fileName: basename(url),
      onComplete: (filePath) => {
        console.info(filePath)
      },
      onProgress: (chunk, size) => {
        if (!progressBar) {
          progressBar = createProgressBar(size)
        }

        progressBar.tick(chunk.length)
      },
      onError: (error) => {
        console.info(error)
      },
    })
  } catch (error) {
    console.info(error)
  }
})()
