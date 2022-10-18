import chalk from 'chalk'
import rimraf from 'rimraf'
import { basename } from 'path'
import { promisify } from 'util'
import { IListrContext, IPackOpition } from './typing'
import { ListrTaskWrapper, ListrDefaultRenderer } from 'listr2'
import { parse, decrypt, loadFile, isMasUrl, isAppType, isHashCode, isPackFile, isCommandType, resolveMasUrl } from './utils'
import {
  download,
  install,
  active,
  exec,
  isAppleCPU,
  Homebrew_DIR,
  tmpdir,
  APP_DIR,
  isInstalled,
  commandLineTools,
  isBrewUrl,
  execute
} from '../lib'

export function createFileFormatVerifyTask(filePath: string) {
  return {
    title: 'Verify config file format',
    task: () => {
      if (!isPackFile(filePath)) {
        throw new Error(chalk.red('The file format is incorrect, please use the .pack file format.'))
      }
    }
  }
}

export function createLoadFileTask(filePath: string) {
  const fileName = basename(filePath)

  return {
    title: `Loading ${fileName} file`,
    task: async (ctx: IListrContext) => {
      try {
        ctx.text = await loadFile(filePath)
      } catch (error) {
        throw new Error(chalk.red((<Error>error).message))
      }
    }
  }
}

export function createDecryptFileTask(filePath: string, password: string) {
  const fileName = basename(filePath)

  return {
    title: `Decrypt ${fileName} file`,
    skip: (ctx: IListrContext) => !isHashCode(ctx.text),
    task: (ctx: IListrContext) => {
      try {
        ctx.text = decrypt(ctx.text, password)
      } catch (error) {
        throw new Error(chalk.red('Incorrect password'))
      }
    }
  }
}

export function createParseFileTask(filePath: string) {
  const fileName = basename(filePath)

  return {
    title: `Parsing ${fileName} file`,
    task: (ctx: IListrContext) => {
      const result = parse<Array<IPackOpition>>(ctx.text)
      ctx.tasks = result && Array.isArray(result) ? result : []
    }
  }
}

export function createInstallAppTasks(ctx: IListrContext) {
  return [
    createCommandLineToolsTasks(),
    ...ctx.tasks
      .filter((task) => isAppType(task))
      .map((app) => {
        return {
          title: app.alias || app.name,
          task: async (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
            if (await isInstalled(app.name)) {
              return []
            }

            let actions: Array<{
              title: string
              task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => void
            }> = [createDownloadTask(app)]

            if (app.action && app.action.includes('install')) {
              actions = [...actions, createInstallTask(app)]
            }

            if (app.action && hasActiveAction(app.action)) {
              actions = [...actions, createActiveTask(app)]
            }

            return task.newListr(actions, {
              rendererOptions: {
                collapse: true
              }
            })
          }
        }
      })
  ]
}

export function createExecCommandTasks(ctx: IListrContext) {
  return ctx.tasks
    .filter((task) => isCommandType(task))
    .map((command) => {
      const title = command.description
      const cmds = Array.isArray(command.cmd) ? command.cmd : [command.cmd]

      return {
        title,
        task: async (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
          try {
            for (const cmd of cmds) {
              if (isSudoCommand(cmd)) {
                const password = await task.prompt<string>({
                  type: 'password',
                  name: 'password',
                  message: 'Enter sudo password?'
                })

                const { stderr } = exec(cmd.replace('sudo', `echo ${password} | sudo -S`).trim())

                if (stderr && stderr !== 'Password:') {
                  throw new Error(stderr.toString())
                }
              } else {
                const { code, stderr } = exec(cmd)

                if (code) {
                  throw new Error(stderr)
                }
              }
            }
          } catch (error) {
            throw new Error(chalk.red((<Error>error).message))
          }
        }
      }
    })
}

export function createGenerateTmpDirectoryTask() {
  return async (ctx: IListrContext) => {
    try {
      ctx.tmpdir = await tmpdir()
    } catch (error) {
      throw new Error(chalk.red((<Error>error).message))
    }
  }
}

export function createRemoveTmpDirectoryTask() {
  return async (ctx: IListrContext) => {
    try {
      if (ctx.tmpdir) {
        await promisify(rimraf)(ctx.tmpdir)
      }
    } catch (error) {
      throw new Error(chalk.red((<Error>error).message))
    }
  }
}

function createDownloadTask(app: IPackOpition) {
  return {
    title: 'Downloading',
    task: async (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
      const url = getDownloadUrl(app.downloadUrl)

      if (isMasUrl(url)) {
        task.title = 'Downloaded'
        ctx.filePaths.set(app.name, resolveMasUrl(url))
      } else if (isBrewUrl(url)) {
        task.title = 'Downloaded'
        ctx.filePaths.set(app.name, url)
      } else {
        try {
          const filePath = await download({
            url,
            dir: ctx.tmpdir,
            onProgress: ({ percent }) => (task.title = `Downloading [${percent}%]`)
          })

          task.title = 'Downloaded'
          ctx.filePaths.set(app.name, filePath)
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
      }
    }
  }
}

function createInstallTask(app: IPackOpition) {
  return {
    title: 'Installing',
    task: async (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
      try {
        const filePath = await install({
          appName: app.name,
          dest: getDestDirectory(app.name),
          filePath: <string>ctx.filePaths.get(app.name)
        })

        task.title = 'Installed'
        ctx.filePaths.set(app.name, filePath)
      } catch (error) {
        throw new Error(chalk.red((<Error>error).message))
      }
    }
  }
}

function createActiveTask(app: IPackOpition) {
  return {
    title: 'Activating',
    task: async (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
      try {
        await active(getActiveActionSteps(app))

        task.title = 'Activated'
      } catch (error) {
        throw new Error(chalk.red((<Error>error).message))
      }
    }
  }
}

function createCommandLineToolsTasks() {
  return {
    title: 'CommandLineTools',
    task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
      const isInstalled = commandLineTools.isInstalled()

      return task.newListr(
        [
          {
            title: 'Downloading',
            task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
              if (!isInstalled) {
                commandLineTools.download()
              }

              task.title = 'Downloaded'
            }
          },
          {
            title: 'Installing',
            task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
              if (!isInstalled) {
                commandLineTools.install()
              }

              task.title = 'Installed'
            }
          }
        ],
        {
          rendererOptions: {
            collapse: true
          }
        }
      )
    }
  }
}

function isSudoCommand(cmd: string) {
  return cmd.slice(0, 4) === 'sudo'
}

function getDownloadUrl(url: string | Array<Array<string>>) {
  if (Array.isArray(url)) {
    return url.filter((item) => item[0] === (isAppleCPU ? 'arm' : 'intel'))[0][1]
  } else {
    return url
  }
}

function getDestDirectory(appName: string) {
  return appName.toLowerCase() === 'brew' ? Homebrew_DIR : APP_DIR
}

function hasActiveAction(action: Array<string>) {
  for (const item of action) {
    if (Array.isArray(item) && item[0] === 'active') {
      return true
    }
  }

  return false
}

function getActiveActionSteps(app: IPackOpition) {
  for (const item of app.action) {
    if (Array.isArray(item) && item[0] === 'active') {
      return <Array<string>>item[1]
    }
  }

  return []
}
