import echo from './echo'
import { basename } from 'path'
import download from './download'
import { exec } from 'child_process'
import { IPackOpition } from './types'
import {
  isPackFile,
  loadFile,
  parse,
  tmpdir,
  decrypt,
  returned,
  isAppType,
  capitalize,
  isAppleCPU,
  isCommandType,
  createProgressBar,
} from './utils'

const [filePath = '', password = ''] = process.argv.slice(2)
const fileName = basename(filePath)

if (!returned(isPackFile(filePath), echo.loading(`Loading ${fileName} file`))) {
  echo.error('The file format is incorrect, please use the .pack file format.')
  process.exit(1)
}

;(async function () {
  try {
    let text = returned(await loadFile(filePath), echo.loading(`${capitalize(fileName)} file loading complete`))

    if (password) {
      text = returned(decrypt(text, password), echo.loading(`Decrypt ${fileName} file`))
    }

    const dir = await tmpdir()
    const tasks = returned(parse<Array<IPackOpition>>(text), echo.loading(`Parsing ${fileName} file`))

    for (const task of tasks) {
      if (isAppType(task)) {
        await executeDownloadAndInstall(task, dir)
      } else if (isCommandType(task)) {
        await executeCommand(task)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      echo.error(error.message)
    }
  }
})()

function executeDownloadAndInstall(obj: IPackOpition, dir: string, rate = 0) {
  return new Promise((resolve, reject) => {
    download({
      dir,
      url: getDownloadUrl(obj.downloadUrl),
      onError: (error) => reject(error),
      onComplete: (filePath) => resolve(filePath),
      onProgress: (chunk, size) => echo.progress(obj.name, (rate += chunk.length), size),
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
