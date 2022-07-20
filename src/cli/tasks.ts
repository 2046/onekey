import chalk from 'chalk'
import rimraf from 'rimraf'
import { basename } from 'path'
import { promisify } from 'util'
import { IListrContext, IPackOpition } from './typing'
import { ListrTaskWrapper, ListrDefaultRenderer } from 'listr2'
import { download, install, exec, isAppleCPU, Homebrew_DIR, tmpdir, appdir, isInstalled, memoize } from '../lib'
import { parse, decrypt, loadFile, isMasUrl, isAppType, isHashCode, isPackFile, isCommandType, resolveMasUrl } from './utils'

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
  const tasks = [
    {
      title: 'Commandline Tools',
      task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr([
          {
            title: 'Downloading',
            task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
              exec('touch /tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress')
              exec(`softwareupdate -d "${memoize(getCommandLineToolsLabel)}"`)

              task.title = 'Downloaded'
            }
          },
          {
            title: 'Installing',
            task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
              exec(`softwareupdate -i "${memoize(getCommandLineToolsLabel)}"`)

              task.title = 'Installed'
            }
          }
        ])
      }
    }
  ]

  return [
    ...tasks,
    ...ctx.tasks
      .filter((task) => isAppType(task))
      .map((app) => {
        return {
          title: app.alias || app.name,
          task: async (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
            if (await isInstalled(app.name)) {
              return []
            }

            let actions = [createDownloadTask(app)]

            if (app.action && app.action.includes('install')) {
              actions = [...actions, createInstallTask(app)]
            }

            return task.newListr(actions)
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
        task: () => {
          try {
            for (const cmd of cmds) {
              exec(cmd)
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

function getDownloadUrl(url: string | Array<Array<string>>) {
  if (Array.isArray(url)) {
    return url.filter((item) => item[0] === (isAppleCPU ? 'arm' : 'intel'))[0][1]
  } else {
    return url
  }
}

function getDestDirectory(appName: string) {
  if (appName.toLowerCase() === 'brew') {
    return Homebrew_DIR
  } else {
    return appdir()
  }
}

function getCommandLineToolsLabel() {
  const { stdout, code } = exec('softwareupdate -l | grep "*.*Command Line" | head -n 1')

  return code ? '' : stdout.replace('* Label: ', '').trim()
}
