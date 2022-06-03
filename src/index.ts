import chalk from 'chalk'
import Progress from 'progress'
import download from './download'
import { exec } from 'child_process'
import { IPackOpition } from './types'
import {
  isPackFile,
  loadFile,
  parse,
  decrypt,
  tmpdir,
  isAppType,
  isAppleCPU,
  isCommandType,
  createProgressBar,
} from './utils'

const [filePath = '', password = ''] = process.argv.slice(2)

if (!isPackFile(filePath)) {
  console.error(chalk.red('The file format is incorrect, please use the .pack file format.'))
  process.exit(1)
}

;(async function () {
  try {
    const dir = await tmpdir()
    let text = await loadFile(filePath)

    if (password) {
      text = decrypt(text, password)
    }

    for (const obj of parse<Array<IPackOpition>>(text)) {
      if (isAppType(obj)) {
        await executeDownloadAndInstall(obj, dir)
      } else if (isCommandType(obj)) {
        await executeCommand(obj)
      }
    }
  } catch (error) {
    console.info(error)
  }
})()

function executeDownloadAndInstall(
  obj: IPackOpition,
  dir: string,
  progressBar: null | Progress = null
) {
  return new Promise((resolve, reject) => {
    download({
      dir,
      url: getDownloadUrl(obj.downloadUrl),
      onComplete: (filePath) => {
        console.info(filePath)
        resolve(filePath)
      },
      onProgress: (chunk, size) => {
        if (!progressBar) {
          progressBar = createProgressBar(size)
        }

        progressBar.tick(chunk.length)
      },
      onError: (error) => reject(error),
    })
  })
}

async function executeCommand(obj: IPackOpition) {
  console.info(obj.description)

  if (Array.isArray(obj.cmd)) {
    for (const cmd of obj.cmd) {
      await runScript(cmd)
    }
  } else {
    await runScript(obj.cmd)
  }
}

function getDownloadUrl(url: string | Array<Array<string>>) {
  if (Array.isArray(url)) {
    if (isAppleCPU()) {
      return url.filter((item) => item[0] === 'arm')[0][1]
    } else {
      return url.filter((item) => item[0] === 'intel')[0][1]
    }
  } else {
    return url
  }
}

function runScript(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => (error ? reject(error) : resolve({ stdout, stderr })))
  })
}
