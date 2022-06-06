import chalk from 'chalk'
import rimraf from 'rimraf'
import { promisify } from 'util'
import { IListrContext } from './types'
import { tmpdir, isRootUser } from './utils'
import { Listr, ListrTaskWrapper, ListrDefaultRenderer } from 'listr2'
import { getConfigTasks, getInstallAppsTasks, getCommandTasks } from './tasks'

const [filePath = '', password = ''] = process.argv.slice(2)

;(async function () {
  const tasks = [
    {
      title: 'Checking User Permissions',
      task: () => {
        if (!isRootUser()) {
          throw new Error(chalk.red('Please use sudo mode, later processes require advanced privileges'))
        }
      }
    },
    {
      title: 'Load Config File',
      task: (_: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr(getConfigTasks(filePath, password))
      }
    },
    {
      title: 'Generate Temporary Download Directory',
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
        return task.newListr(getInstallAppsTasks(ctx))
      }
    },
    {
      title: 'Change System Settings',
      task: (ctx: IListrContext, task: ListrTaskWrapper<IListrContext, ListrDefaultRenderer>) => {
        return task.newListr(getCommandTasks(ctx))
      }
    },
    {
      title: 'Cleaning Temporary Download Directory',
      task: async (ctx: IListrContext) => {
        try {
          if (ctx.tmpdir) {
            await promisify(rimraf)(ctx.tmpdir)
          }
        } catch (error) {
          throw new Error(chalk.red((<Error>error).message))
        }
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
