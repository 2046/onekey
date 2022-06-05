import chalk from 'chalk'
import { basename } from 'path'
import download from './download'
import { exec } from 'child_process'
import { IPackOpition, IListrContext } from './types'
import { Listr, ListrTaskWrapper, ListrDefaultRenderer } from 'listr2'
import {
  isPackFile,
  loadFile,
  parse,
  tmpdir,
  decrypt,
  isAppType,
  isAppleCPU,
  isCommandType,
  calcPercent
} from './utils'

const [filePath = '', password = ''] = process.argv.slice(2)
const fileName = basename(filePath)

;(async function () {
  const configTasks = [
    {
      title: 'Verify config file format',
      task: () => {
        if (!isPackFile(filePath)) {
          throw new Error(chalk.red('The file format is incorrect, please use the .pack file format.'))
        }
      }
    },
    {
      title: `Loading ${fileName} file`,
      task: async (ctx: IListrContext) => {
        try {
          ctx.text = await loadFile(filePath)
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
      }
    },
    {
      title: `Decrypt ${fileName} file`,
      skip: () => !password,
      task: (ctx: IListrContext) => {
        try {
          ctx.text = decrypt(ctx.text, password)
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
      }
    },
    {
      title: `Parsing ${fileName} file`,
      task: (ctx: IListrContext) => {
        try {
          ctx.tasks = parse<Array<IPackOpition>>(ctx.text)
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
      }
    }
  ]

  const tasks = [
    {
      title: 'Load Config File',
      task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr(configTasks)
      }
    },
    {
      title: 'Generate Download Directory',
      task: async (ctx: IListrContext) => {
        try {
          ctx.tmpdir = await tmpdir()
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
      }
    },
    {
      title: 'Install Apps',
      task: (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr(
          ctx.tasks
            .filter((task) => isAppType(task))
            .map((app) => {
              const title = app.name
              const url = getDownloadUrl(app.downloadUrl)

              return {
                title,
                task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
                  return task.newListr([
                    {
                      title: 'Downloading',
                      task: async (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
                        try {
                          let rate = 0

                          const filePath = await execDownload(url, ctx.tmpdir, (chunk, size) => {
                            task.title = `Downloading [${calcPercent((rate += chunk.length), size)}%]`
                          })

                          task.title = 'Downloaded'
                          ctx.filePaths.set(title, filePath)
                        } catch (error) {
                          throw new Error(chalk.red((<Error>error).message))
                        }
                      }
                    },
                    {
                      title: 'Installing',
                      task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
                        task.title = `Installed dir: ${<string>ctx.filePaths.get(title)}`
                      }
                    }
                  ])
                }
              }
            })
        )
      }
    },
    {
      title: 'Execute Commands',
      task: (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr(
          ctx.tasks
            .filter((task) => isCommandType(task))
            .map((command) => {
              const title = command.description
              const cmds = Array.isArray(command.cmd) ? command.cmd : [command.cmd]

              return {
                title,
                task: async () => {
                  try {
                    for (const cmd of cmds) {
                      await execCommand(cmd)
                    }
                  } catch (error) {
                    throw new Error(chalk.red((<Error>error).message))
                  }
                }
              }
            })
        )
      }
    }
  ]

  const listr = new Listr<IListrContext>(tasks, {
    concurrent: false,
    exitOnError: true,
    registerSignalListeners: false,
    rendererOptions: { collapse: false, collapseErrors: false }
  })

  try {
    await listr.run({
      text: '',
      tasks: [],
      tmpdir: '',
      filePaths: new Map()
    })
  } catch (error) {
    error
  }
})()

function execDownload(url: string, dir: string, onProgress: (chunk: Buffer, size: number) => void) {
  return new Promise<string>((resolve, reject) => {
    download({
      url,
      dir,
      onProgress,
      onError: (error) => reject(error),
      onComplete: (filePath) => resolve(filePath)
    })
  })
}

function execCommand(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => (error ? reject(error) : resolve({ stdout, stderr })))
  })
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
